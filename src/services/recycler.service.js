const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const ApiError = require('../utils/apiError');

const sanitizeAccount = (user) => {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

/**
 * Retrieve list of recyclers with flexible filtering
 */
const getAllRecyclers = async ({ authorized, pickupAvailable, materialId, search } = {}) => {
  const where = {};

  if (authorized !== undefined) {
    where.authorizedStatus = authorized === 'true' || authorized === true;
  }

  if (pickupAvailable !== undefined) {
    where.pickupAvailable = pickupAvailable === 'true' || pickupAvailable === true;
  }

  if (materialId) {
    where.supportedMaterials = {
      some: { id: materialId }
    };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } }
    ];
  }

  const recyclers = await prisma.recycler.findMany({
    where,
    orderBy: { name: 'asc' },
    include: {
      supportedMaterials: {
        select: {
          id: true,
          name: true,
          code: true,
          unit: true
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true
        }
      }
    }
  });

  return recyclers.map(r => ({
    id: r.id,
    userId: r.userId,
    name: r.name,
    address: r.address,
    latitude: r.latitude,
    longitude: r.longitude,
    authorizedStatus: r.authorizedStatus,
    authorizationId: r.authorizationId,
    pickupAvailable: r.pickupAvailable,
    contactInfo: r.contactInfo,
    supportedMaterialsCount: r.supportedMaterials ? r.supportedMaterials.length : 0,
    supportedMaterials: r.supportedMaterials || [],
    account: sanitizeAccount(r.user),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
  }));
};

/**
 * Retrieve single recycler by ID
 */
const getRecyclerById = async (id) => {
  const recycler = await prisma.recycler.findUnique({
    where: { id },
    include: {
      supportedMaterials: {
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
          unit: true
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true
        }
      }
    }
  });

  if (!recycler) {
    throw new ApiError(404, `Recycler with ID '${id}' not found`);
  }

  return {
    id: recycler.id,
    userId: recycler.userId,
    name: recycler.name,
    address: recycler.address,
    latitude: recycler.latitude,
    longitude: recycler.longitude,
    authorizedStatus: recycler.authorizedStatus,
    authorizationId: recycler.authorizationId,
    pickupAvailable: recycler.pickupAvailable,
    contactInfo: recycler.contactInfo,
    supportedMaterials: recycler.supportedMaterials || [],
    account: sanitizeAccount(recycler.user),
    createdAt: recycler.createdAt,
    updatedAt: recycler.updatedAt
  };
};

/**
 * Retrieve list of materials supported by a specific recycler with current pricing
 */
const getRecyclerMaterials = async (id) => {
  const recycler = await prisma.recycler.findUnique({
    where: { id },
    include: {
      supportedMaterials: {
        include: {
          prices: {
            orderBy: { validFrom: 'desc' },
            take: 1
          }
        }
      }
    }
  });

  if (!recycler) {
    throw new ApiError(404, `Recycler with ID '${id}' not found`);
  }

  return recycler.supportedMaterials.map(m => {
    const latestPrice = m.prices && m.prices.length > 0 ? m.prices[0] : null;
    return {
      id: m.id,
      name: m.name,
      code: m.code,
      description: m.description,
      unit: m.unit,
      currentPricePerKg: latestPrice ? parseFloat(latestPrice.pricePerKg.toString()) : null,
      latestPriceRecord: latestPrice
    };
  });
};

/**
 * Create a new Recycler profile and account (Admin only)
 */
const createRecycler = async (data) => {
  let userId = data.userId;

  // If userId is provided, ensure user exists and does not already have a recycler profile
  if (userId) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { recyclerProfile: true }
    });

    if (!existingUser) {
      throw new ApiError(404, `User with ID '${userId}' not found`);
    }

    if (existingUser.recyclerProfile) {
      throw new ApiError(409, `User '${existingUser.email}' already has an active recycler profile`);
    }
  } else {
    // Check duplicate email
    const duplicateUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (duplicateUser) {
      throw new ApiError(409, `An account with email '${data.email}' already exists`);
    }

    // Create user account with RECYCLER role
    const passwordHash = await bcrypt.hash(data.password, 10);
    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone || null,
        passwordHash,
        role: 'RECYCLER'
      }
    });

    userId = newUser.id;
  }

  // Check unique authorizationId if provided
  if (data.authorizationId) {
    const duplicateAuth = await prisma.recycler.findUnique({
      where: { authorizationId: data.authorizationId }
    });
    if (duplicateAuth) {
      throw new ApiError(409, `Authorization ID '${data.authorizationId}' is already registered to another recycler`);
    }
  }

  // Build supported materials connection
  const materialConnect = data.supportedMaterialIds && data.supportedMaterialIds.length > 0
    ? { connect: data.supportedMaterialIds.map(id => ({ id })) }
    : undefined;

  const recycler = await prisma.recycler.create({
    data: {
      userId,
      name: data.name,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      authorizedStatus: data.authorizedStatus || false,
      authorizationId: data.authorizationId || null,
      pickupAvailable: data.pickupAvailable || false,
      contactInfo: data.contactInfo,
      ...(materialConnect ? { supportedMaterials: materialConnect } : {})
    },
    include: {
      supportedMaterials: {
        select: { id: true, name: true, code: true, unit: true }
      },
      user: {
        select: { id: true, name: true, email: true, phone: true, role: true }
      }
    }
  });

  return {
    id: recycler.id,
    userId: recycler.userId,
    name: recycler.name,
    address: recycler.address,
    latitude: recycler.latitude,
    longitude: recycler.longitude,
    authorizedStatus: recycler.authorizedStatus,
    authorizationId: recycler.authorizationId,
    pickupAvailable: recycler.pickupAvailable,
    contactInfo: recycler.contactInfo,
    supportedMaterials: recycler.supportedMaterials,
    account: sanitizeAccount(recycler.user),
    createdAt: recycler.createdAt,
    updatedAt: recycler.updatedAt
  };
};

/**
 * Update an existing Recycler profile (Admin only)
 */
const updateRecycler = async (id, updateData) => {
  const existing = await prisma.recycler.findUnique({
    where: { id }
  });

  if (!existing) {
    throw new ApiError(404, `Recycler with ID '${id}' not found`);
  }

  if (updateData.authorizationId && updateData.authorizationId !== existing.authorizationId) {
    const duplicateAuth = await prisma.recycler.findUnique({
      where: { authorizationId: updateData.authorizationId }
    });
    if (duplicateAuth && duplicateAuth.id !== id) {
      throw new ApiError(409, `Authorization ID '${updateData.authorizationId}' is already registered`);
    }
  }

  const dataToUpdate = { ...updateData };

  // Handle supportedMaterialIds array update
  if (updateData.supportedMaterialIds !== undefined) {
    delete dataToUpdate.supportedMaterialIds;
    dataToUpdate.supportedMaterials = {
      set: updateData.supportedMaterialIds.map(matId => ({ id: matId }))
    };
  }

  const updated = await prisma.recycler.update({
    where: { id },
    data: dataToUpdate,
    include: {
      supportedMaterials: {
        select: { id: true, name: true, code: true, unit: true }
      },
      user: {
        select: { id: true, name: true, email: true, phone: true, role: true }
      }
    }
  });

  return {
    id: updated.id,
    userId: updated.userId,
    name: updated.name,
    address: updated.address,
    latitude: updated.latitude,
    longitude: updated.longitude,
    authorizedStatus: updated.authorizedStatus,
    authorizationId: updated.authorizationId,
    pickupAvailable: updated.pickupAvailable,
    contactInfo: updated.contactInfo,
    supportedMaterials: updated.supportedMaterials,
    account: sanitizeAccount(updated.user),
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt
  };
};

module.exports = {
  getAllRecyclers,
  getRecyclerById,
  getRecyclerMaterials,
  createRecycler,
  updateRecycler
};
