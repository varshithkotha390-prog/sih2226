const prisma = require('../config/db');
const ApiError = require('../utils/apiError');

// Sensible state-machine transitions for Transactions
const VALID_TX_TRANSITIONS = {
  PENDING: ['ACCEPTED', 'CANCELLED', 'REJECTED'],
  ACCEPTED: ['PICKUP_SCHEDULED', 'CANCELLED'],
  PICKUP_SCHEDULED: ['HANDED_OVER', 'CANCELLED'],
  HANDED_OVER: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [], // Terminal state
  CANCELLED: [], // Terminal state
  REJECTED: []   // Terminal state
};

/**
 * Initiate a new transaction by an authenticated collector
 */
const createTransaction = async ({ collectorId, lotId, recyclerId, offeredPrice }) => {
  // 1. Validate collector
  const collector = await prisma.user.findUnique({
    where: { id: collectorId }
  });

  if (!collector || collector.role !== 'COLLECTOR') {
    throw new ApiError(403, 'Only authenticated collectors can initiate transactions');
  }

  // 2. Validate lot existence, ownership, and status
  const lot = await prisma.lot.findUnique({
    where: { id: lotId },
    include: {
      material: {
        include: {
          prices: {
            orderBy: { validFrom: 'desc' },
            take: 1
          }
        }
      }
    }
  });

  if (!lot) {
    throw new ApiError(404, `Lot with ID '${lotId}' not found`);
  }

  if (lot.collectorId !== collectorId) {
    throw new ApiError(403, 'You do not have permission to initiate a transaction for a lot you do not own');
  }

  if (lot.status !== 'AVAILABLE') {
    throw new ApiError(400, `Cannot create transaction: Lot is currently '${lot.status}'. Only 'AVAILABLE' lots can be traded`);
  }

  // 3. Validate recycler existence and material compatibility
  const recycler = await prisma.recycler.findUnique({
    where: { id: recyclerId },
    include: {
      supportedMaterials: {
        select: { id: true, name: true, code: true }
      }
    }
  });

  if (!recycler) {
    throw new ApiError(404, `Recycler with ID '${recyclerId}' not found`);
  }

  const isMaterialCompatible = recycler.supportedMaterials.some(m => m.id === lot.materialId);
  if (!isMaterialCompatible) {
    throw new ApiError(
      400,
      `Material Incompatible: Recycler '${recycler.name}' does not accept '${lot.material.name}'`
    );
  }

  // 4. Calculate total amount deterministically on the backend
  const weightNum = parseFloat(lot.weight.toString());
  const latestPriceRecord = lot.material.prices && lot.material.prices.length > 0 ? lot.material.prices[0] : null;
  const referenceRate = latestPriceRecord ? parseFloat(latestPriceRecord.pricePerKg.toString()) : 100.0;

  // Use offeredPrice if specified by collector/deal; otherwise fallback to reference spot rate
  const ratePerKg = offeredPrice !== undefined ? parseFloat(offeredPrice) : referenceRate;
  const totalAmount = parseFloat((weightNum * ratePerKg).toFixed(2));

  // 5. Store transaction
  const transaction = await prisma.transaction.create({
    data: {
      lotId: lot.id,
      collectorId: collector.id,
      recyclerId: recycler.id,
      offeredPrice: ratePerKg,
      finalPrice: ratePerKg,
      totalAmount,
      paymentStatus: 'PENDING',
      transactionStatus: 'PENDING'
    },
    include: {
      lot: {
        select: {
          id: true,
          lotNumber: true,
          weight: true,
          status: true,
          collectorLocation: true
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
      recycler: {
        select: {
          id: true,
          name: true,
          address: true,
          contactInfo: true,
          authorizedStatus: true,
          pickupAvailable: true
        }
      }
    }
  });

  return {
    id: transaction.id,
    lotId: transaction.lotId,
    lotNumber: transaction.lot.lotNumber,
    material: lot.material.name,
    weight: weightNum,
    unit: lot.material.unit,
    ratePerKg,
    totalAmount: parseFloat(transaction.totalAmount.toString()),
    transactionStatus: transaction.transactionStatus,
    paymentStatus: transaction.paymentStatus,
    collector: transaction.collector,
    recycler: transaction.recycler,
    createdAt: transaction.createdAt
  };
};

/**
 * Retrieve a specific transaction by ID with permission checks
 */
const getTransactionById = async (id, currentUser) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      lot: {
        include: {
          material: {
            select: { id: true, name: true, code: true, unit: true }
          }
        }
      },
      collector: {
        select: { id: true, name: true, email: true, phone: true }
      },
      recycler: {
        select: {
          id: true,
          userId: true,
          name: true,
          address: true,
          contactInfo: true,
          authorizedStatus: true,
          pickupAvailable: true
        }
      }
    }
  });

  if (!transaction) {
    throw new ApiError(404, `Transaction with ID '${id}' not found`);
  }

  // Access control
  const isCollector = currentUser.id === transaction.collectorId;
  const isRecycler = currentUser.id === transaction.recycler.userId;
  const isAdmin = currentUser.role === 'ADMIN';

  if (!isCollector && !isRecycler && !isAdmin) {
    throw new ApiError(403, 'Access denied: You are not authorized to view this transaction');
  }

  return {
    id: transaction.id,
    lotId: transaction.lotId,
    lotNumber: transaction.lot.lotNumber,
    material: transaction.lot.material.name,
    weight: parseFloat(transaction.lot.weight.toString()),
    unit: transaction.lot.material.unit,
    offeredPrice: parseFloat(transaction.offeredPrice.toString()),
    finalPrice: transaction.finalPrice ? parseFloat(transaction.finalPrice.toString()) : null,
    totalAmount: transaction.totalAmount ? parseFloat(transaction.totalAmount.toString()) : null,
    transactionStatus: transaction.transactionStatus,
    paymentStatus: transaction.paymentStatus,
    collector: transaction.collector,
    recycler: transaction.recycler,
    createdAt: transaction.createdAt,
    completedAt: transaction.completedAt,
    updatedAt: transaction.updatedAt
  };
};

/**
 * Retrieve transactions for the authenticated user
 */
const getMyTransactions = async (currentUser, { status } = {}) => {
  const where = {};

  if (status) {
    where.transactionStatus = status.toUpperCase();
  }

  if (currentUser.role === 'COLLECTOR') {
    where.collectorId = currentUser.id;
  } else if (currentUser.role === 'RECYCLER') {
    const recyclerProfile = await prisma.recycler.findUnique({
      where: { userId: currentUser.id }
    });
    if (!recyclerProfile) {
      return [];
    }
    where.recyclerId = recyclerProfile.id;
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      lot: {
        include: {
          material: {
            select: { id: true, name: true, code: true, unit: true }
          }
        }
      },
      collector: {
        select: { id: true, name: true, phone: true }
      },
      recycler: {
        select: { id: true, name: true, contactInfo: true }
      }
    }
  });

  return transactions.map(tx => ({
    id: tx.id,
    lotId: tx.lotId,
    lotNumber: tx.lot.lotNumber,
    material: tx.lot.material.name,
    weight: parseFloat(tx.lot.weight.toString()),
    totalAmount: tx.totalAmount ? parseFloat(tx.totalAmount.toString()) : null,
    transactionStatus: tx.transactionStatus,
    paymentStatus: tx.paymentStatus,
    collector: tx.collector,
    recycler: tx.recycler,
    createdAt: tx.createdAt,
    completedAt: tx.completedAt
  }));
};

/**
 * Update transaction status with transition validation & lot synchronization
 */
const updateTransactionStatus = async (id, currentUser, newStatus, newPaymentStatus) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      recycler: true,
      lot: true
    }
  });

  if (!transaction) {
    throw new ApiError(404, `Transaction with ID '${id}' not found`);
  }

  const currentStatus = transaction.transactionStatus;

  // 1. Validate status transition
  const allowedTransitions = VALID_TX_TRANSITIONS[currentStatus] || [];
  if (!allowedTransitions.includes(newStatus)) {
    throw new ApiError(
      400,
      `Invalid transaction transition from '${currentStatus}' to '${newStatus}'. Allowed transitions: [${allowedTransitions.join(', ') || 'None (Terminal)'}]`
    );
  }

  // 2. Authorization on transitions
  const isCollector = currentUser.id === transaction.collectorId;
  const isRecycler = currentUser.id === transaction.recycler.userId;
  const isAdmin = currentUser.role === 'ADMIN';

  if (!isCollector && !isRecycler && !isAdmin) {
    throw new ApiError(403, 'You do not have permission to update this transaction');
  }

  // Collectors can only cancel while PENDING or ACCEPTED
  if (isCollector && !isAdmin) {
    if (newStatus !== 'CANCELLED') {
      throw new ApiError(403, 'Collectors can only cancel pending or accepted transactions');
    }
  }

  // 3. Determine simulated payment status
  let resolvedPaymentStatus = newPaymentStatus || transaction.paymentStatus;
  let completedAt = transaction.completedAt;

  if (newStatus === 'COMPLETED') {
    // Simulate successful payment upon deal completion
    resolvedPaymentStatus = newPaymentStatus || 'PAID';
    completedAt = new Date();
  } else if (newStatus === 'CANCELLED' || newStatus === 'REJECTED') {
    resolvedPaymentStatus = 'FAILED';
  }

  // 4. Update transaction
  const updatedTx = await prisma.transaction.update({
    where: { id },
    data: {
      transactionStatus: newStatus,
      paymentStatus: resolvedPaymentStatus,
      completedAt
    }
  });

  // 5. Synchronize lot status
  if (newStatus === 'ACCEPTED' && transaction.lot.status === 'AVAILABLE') {
    await prisma.lot.update({
      where: { id: transaction.lotId },
      data: { status: 'ASSIGNED' }
    });
  } else if ((newStatus === 'PICKUP_SCHEDULED' || newStatus === 'HANDED_OVER') && transaction.lot.status !== 'IN_TRANSIT') {
    await prisma.lot.update({
      where: { id: transaction.lotId },
      data: { status: 'IN_TRANSIT' }
    });
  } else if (newStatus === 'COMPLETED') {
    await prisma.lot.update({
      where: { id: transaction.lotId },
      data: { status: 'COMPLETED' }
    });
  } else if (newStatus === 'CANCELLED' && transaction.lot.status === 'ASSIGNED') {
    // Revert lot to AVAILABLE if deal is cancelled
    await prisma.lot.update({
      where: { id: transaction.lotId },
      data: { status: 'AVAILABLE' }
    });
  }

  return {
    id: updatedTx.id,
    previousStatus: currentStatus,
    transactionStatus: updatedTx.transactionStatus,
    paymentStatus: updatedTx.paymentStatus,
    totalAmount: updatedTx.totalAmount ? parseFloat(updatedTx.totalAmount.toString()) : null,
    completedAt: updatedTx.completedAt,
    updatedAt: updatedTx.updatedAt
  };
};

module.exports = {
  createTransaction,
  getTransactionById,
  getMyTransactions,
  updateTransactionStatus,
  VALID_TX_TRANSITIONS
};
