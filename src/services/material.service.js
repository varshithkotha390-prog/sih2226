const prisma = require('../config/db');
const ApiError = require('../utils/apiError');

/**
 * Retrieve all materials with optional search filter and latest spot rate
 */
const getAllMaterials = async ({ search } = {}) => {
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  const materials = await prisma.material.findMany({
    where,
    orderBy: { name: 'asc' },
    include: {
      prices: {
        orderBy: { validFrom: 'desc' },
        take: 1
      }
    }
  });

  return materials.map(mat => {
    const latestPrice = mat.prices && mat.prices.length > 0 ? mat.prices[0] : null;
    return {
      id: mat.id,
      name: mat.name,
      code: mat.code,
      description: mat.description,
      unit: mat.unit,
      currentPricePerKg: latestPrice ? parseFloat(latestPrice.pricePerKg.toString()) : null,
      latestPriceRecord: latestPrice,
      createdAt: mat.createdAt,
      updatedAt: mat.updatedAt
    };
  });
};

/**
 * Retrieve single material by ID with historical prices
 */
const getMaterialById = async (id) => {
  const material = await prisma.material.findUnique({
    where: { id },
    include: {
      prices: {
        orderBy: { validFrom: 'desc' },
        take: 20
      }
    }
  });

  if (!material) {
    throw new ApiError(404, `Material with ID '${id}' not found`);
  }

  const latestPrice = material.prices && material.prices.length > 0 ? material.prices[0] : null;

  return {
    id: material.id,
    name: material.name,
    code: material.code,
    description: material.description,
    unit: material.unit,
    currentPricePerKg: latestPrice ? parseFloat(latestPrice.pricePerKg.toString()) : null,
    recentPrices: material.prices,
    createdAt: material.createdAt,
    updatedAt: material.updatedAt
  };
};

/**
 * Create a new material catalog item (Admin only)
 */
const createMaterial = async ({ name, code, description, unit }) => {
  const existing = await prisma.material.findFirst({
    where: {
      OR: [
        { name: { equals: name, mode: 'insensitive' } },
        ...(code ? [{ code: { equals: code, mode: 'insensitive' } }] : [])
      ]
    }
  });

  if (existing) {
    if (existing.name.toLowerCase() === name.toLowerCase()) {
      throw new ApiError(409, `A material with name '${name}' already exists`);
    }
    if (code && existing.code && existing.code.toUpperCase() === code.toUpperCase()) {
      throw new ApiError(409, `A material with code '${code}' already exists`);
    }
  }

  return await prisma.material.create({
    data: {
      name,
      code: code || null,
      description: description || null,
      unit: unit || 'kg'
    }
  });
};

/**
 * Update an existing material (Admin only)
 */
const updateMaterial = async (id, updateData) => {
  const material = await prisma.material.findUnique({
    where: { id }
  });

  if (!material) {
    throw new ApiError(404, `Material with ID '${id}' not found`);
  }

  // Check unique constraints if name or code is being updated
  if (updateData.name || updateData.code) {
    const duplicate = await prisma.material.findFirst({
      where: {
        id: { not: id },
        OR: [
          ...(updateData.name ? [{ name: { equals: updateData.name, mode: 'insensitive' } }] : []),
          ...(updateData.code ? [{ code: { equals: updateData.code, mode: 'insensitive' } }] : [])
        ]
      }
    });

    if (duplicate) {
      if (updateData.name && duplicate.name.toLowerCase() === updateData.name.toLowerCase()) {
        throw new ApiError(409, `Another material already exists with name '${updateData.name}'`);
      }
      if (updateData.code && duplicate.code && duplicate.code.toUpperCase() === updateData.code.toUpperCase()) {
        throw new ApiError(409, `Another material already exists with code '${updateData.code}'`);
      }
    }
  }

  return await prisma.material.update({
    where: { id },
    data: updateData
  });
};

/**
 * Delete a material (Admin only)
 */
const deleteMaterial = async (id) => {
  const material = await prisma.material.findUnique({
    where: { id }
  });

  if (!material) {
    throw new ApiError(404, `Material with ID '${id}' not found`);
  }

  // Foreign key safety check: prevent deleting if lots reference this material
  const associatedLots = await prisma.lot.count({
    where: { materialId: id }
  });

  if (associatedLots > 0) {
    throw new ApiError(
      400,
      `Cannot delete material '${material.name}'. It is currently referenced by ${associatedLots} active lot(s).`
    );
  }

  await prisma.material.delete({
    where: { id }
  });

  return { id, name: material.name, deleted: true };
};

module.exports = {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial
};
