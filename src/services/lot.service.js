const prisma = require('../config/db');
const ApiError = require('../utils/apiError');
const { sanitizeUser } = require('./auth.service');

// Sensible lot lifecycle transitions
const VALID_LOT_TRANSITIONS = {
  AVAILABLE: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_TRANSIT', 'AVAILABLE', 'CANCELLED'],
  IN_TRANSIT: ['COMPLETED', 'ASSIGNED'],
  COMPLETED: [], // Terminal state
  CANCELLED: []  // Terminal state
};

/**
 * Generate a clean, human-readable unique lot number
 * Format: LOT-2026-XXXXX
 */
const generateUniqueLotNumber = async () => {
  const year = new Date().getFullYear();
  let unique = false;
  let lotNumber = '';

  while (!unique) {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    lotNumber = `LOT-${year}-${randomSuffix}`;
    const existing = await prisma.lot.findUnique({
      where: { lotNumber }
    });
    if (!existing) unique = true;
  }

  return lotNumber;
};

/**
 * Create a new e-waste lot by an authenticated collector
 */
const createLot = async ({
  collectorId,
  materialId,
  weight,
  latitude,
  longitude,
  imageUrl,
  collectorLocation
}) => {
  // 1. Validate collector account
  const collector = await prisma.user.findUnique({
    where: { id: collectorId }
  });

  if (!collector) {
    throw new ApiError(404, 'Collector account not found');
  }

  if (collector.role !== 'COLLECTOR' && collector.role !== 'ADMIN') {
    throw new ApiError(403, 'Only users with the COLLECTOR role can create lots');
  }

  // 2. Validate material existence
  const material = await prisma.material.findUnique({
    where: { id: materialId },
    include: {
      prices: {
        orderBy: { validFrom: 'desc' },
        take: 5
      }
    }
  });

  if (!material) {
    throw new ApiError(404, `Invalid material: Material with ID '${materialId}' does not exist`);
  }

  // 3. Validate weight
  if (!weight || weight <= 0) {
    throw new ApiError(400, 'Weight must be greater than zero');
  }

  // 4. Retrieve current reference / spot price for this material
  const now = new Date();
  let referencePriceRecord = material.prices.find(p => {
    const from = new Date(p.validFrom);
    const to = p.validTo ? new Date(p.validTo) : null;
    return from <= now && (!to || to >= now);
  });

  // Fallback to latest historical price if no active spot window
  if (!referencePriceRecord && material.prices.length > 0) {
    referencePriceRecord = material.prices[0];
  }

  if (!referencePriceRecord) {
    throw new ApiError(400, `Cannot create lot: No price benchmark available for material '${material.name}'`);
  }

  const referenceRatePerKg = parseFloat(referencePriceRecord.pricePerKg.toString());

  // 5. Calculate estimated price based on verified backend rate
  const estimatedPrice = parseFloat((weight * referenceRatePerKg).toFixed(2));

  // 6. Generate unique lot identifier
  const lotNumber = await generateUniqueLotNumber();

  // 7. Store lot in database
  const lot = await prisma.lot.create({
    data: {
      lotNumber,
      collectorId,
      materialId,
      weight,
      estimatedPrice,
      status: 'AVAILABLE',
      imageUrl: imageUrl || null,
      collectorLocation: collectorLocation || `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
      latitude,
      longitude
    },
    include: {
      material: {
        select: {
          id: true,
          name: true,
          code: true,
          unit: true
        }
      },
      collector: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      }
    }
  });

  // 8. Return formatted response
  return {
    id: lot.id,
    lotNumber: lot.lotNumber,
    weight: parseFloat(lot.weight.toString()),
    unit: lot.material.unit,
    referencePricePerKg: referenceRatePerKg,
    priceSource: referencePriceRecord.source,
    estimatedPrice: parseFloat(lot.estimatedPrice.toString()),
    status: lot.status,
    imageUrl: lot.imageUrl,
    collectorLocation: lot.collectorLocation,
    coordinates: {
      latitude: lot.latitude,
      longitude: lot.longitude
    },
    material: lot.material,
    collector: lot.collector,
    createdAt: lot.createdAt,
    updatedAt: lot.updatedAt
  };
};

/**
 * Retrieve single lot by ID with access control checks
 */
const getLotById = async (id, currentUser) => {
  const lot = await prisma.lot.findUnique({
    where: { id },
    include: {
      material: {
        select: {
          id: true,
          name: true,
          code: true,
          unit: true,
          description: true
        }
      },
      collector: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      },
      transactions: {
        select: {
          id: true,
          offeredPrice: true,
          finalPrice: true,
          totalAmount: true,
          transactionStatus: true,
          paymentStatus: true
        }
      }
    }
  });

  if (!lot) {
    throw new ApiError(404, `Lot with ID '${id}' not found`);
  }

  // Access control: If user is COLLECTOR, must be the owner of the lot
  if (currentUser.role === 'COLLECTOR' && lot.collectorId !== currentUser.id) {
    throw new ApiError(403, 'Access denied: You are not authorized to view lots created by another collector');
  }

  return {
    id: lot.id,
    lotNumber: lot.lotNumber,
    weight: parseFloat(lot.weight.toString()),
    estimatedPrice: parseFloat(lot.estimatedPrice.toString()),
    status: lot.status,
    imageUrl: lot.imageUrl,
    collectorLocation: lot.collectorLocation,
    coordinates: {
      latitude: lot.latitude,
      longitude: lot.longitude
    },
    material: lot.material,
    collector: lot.collector,
    transactionsCount: lot.transactions ? lot.transactions.length : 0,
    createdAt: lot.createdAt,
    updatedAt: lot.updatedAt
  };
};

/**
 * Retrieve all lots created by the authenticated collector
 */
const getMyLots = async (collectorId, { status } = {}) => {
  const where = { collectorId };

  if (status) {
    where.status = status.toUpperCase();
  }

  const lots = await prisma.lot.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      material: {
        select: {
          id: true,
          name: true,
          code: true,
          unit: true
        }
      },
      transactions: {
        select: {
          id: true,
          offeredPrice: true,
          transactionStatus: true
        }
      }
    }
  });

  return lots.map(lot => ({
    id: lot.id,
    lotNumber: lot.lotNumber,
    weight: parseFloat(lot.weight.toString()),
    estimatedPrice: parseFloat(lot.estimatedPrice.toString()),
    status: lot.status,
    imageUrl: lot.imageUrl,
    collectorLocation: lot.collectorLocation,
    coordinates: {
      latitude: lot.latitude,
      longitude: lot.longitude
    },
    material: lot.material,
    bidsCount: lot.transactions ? lot.transactions.length : 0,
    createdAt: lot.createdAt,
    updatedAt: lot.updatedAt
  }));
};

/**
 * Update lot status with sensible transition validation
 */
const updateLotStatus = async (id, currentUser, newStatus) => {
  const lot = await prisma.lot.findUnique({
    where: { id }
  });

  if (!lot) {
    throw new ApiError(404, `Lot with ID '${id}' not found`);
  }

  const currentStatus = lot.status;

  // Validate state machine transitions
  const allowedNextStatuses = VALID_LOT_TRANSITIONS[currentStatus] || [];
  if (!allowedNextStatuses.includes(newStatus)) {
    throw new ApiError(
      400,
      `Invalid lot status transition from '${currentStatus}' to '${newStatus}'. Allowed transitions: [${allowedNextStatuses.join(', ') || 'None (Terminal state)'}]`
    );
  }

  // Authorization on transitions:
  // Collectors can only cancel their own lots when they are AVAILABLE
  if (currentUser.role === 'COLLECTOR') {
    if (lot.collectorId !== currentUser.id) {
      throw new ApiError(403, 'You do not have permission to update this lot');
    }
    if (newStatus !== 'CANCELLED') {
      throw new ApiError(403, 'Collectors are only permitted to cancel their own listings');
    }
  }

  const updatedLot = await prisma.lot.update({
    where: { id },
    data: { status: newStatus },
    include: {
      material: {
        select: { id: true, name: true, code: true }
      }
    }
  });

  return {
    id: updatedLot.id,
    lotNumber: updatedLot.lotNumber,
    previousStatus: currentStatus,
    status: updatedLot.status,
    weight: parseFloat(updatedLot.weight.toString()),
    estimatedPrice: parseFloat(updatedLot.estimatedPrice.toString()),
    material: updatedLot.material,
    updatedAt: updatedLot.updatedAt
  };
};

module.exports = {
  createLot,
  getLotById,
  getMyLots,
  updateLotStatus,
  VALID_LOT_TRANSITIONS
};
