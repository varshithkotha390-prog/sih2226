const prisma = require('../config/db');
const ApiError = require('../utils/apiError');

/**
 * Retrieve historical price records for a specific material
 * Supports filtering by location and current-only flag
 */
const getPricesByMaterialId = async (materialId, { location, currentOnly } = {}) => {
  const material = await prisma.material.findUnique({
    where: { id: materialId }
  });

  if (!material) {
    throw new ApiError(404, `Material with ID '${materialId}' not found`);
  }

  const where = { materialId };

  if (location) {
    where.location = { contains: location, mode: 'insensitive' };
  }

  const now = new Date();
  if (currentOnly === 'true' || currentOnly === true) {
    where.validFrom = { lte: now };
    where.OR = [
      { validTo: null },
      { validTo: { gte: now } }
    ];
  }

  const prices = await prisma.price.findMany({
    where,
    orderBy: { validFrom: 'desc' },
    include: {
      material: {
        select: {
          id: true,
          name: true,
          code: true,
          unit: true
        }
      }
    }
  });

  return prices.map(p => ({
    id: p.id,
    materialId: p.materialId,
    materialName: p.material.name,
    materialCode: p.material.code,
    unit: p.material.unit,
    pricePerKg: parseFloat(p.pricePerKg.toString()),
    location: p.location,
    source: p.source,
    validFrom: p.validFrom,
    validTo: p.validTo,
    isCurrent: p.validFrom <= now && (p.validTo === null || p.validTo >= now),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt
  }));
};

/**
 * Record a new price entry (Admin only)
 * Preserves historical pricing without overwriting historical records
 */
const createPrice = async ({ materialId, pricePerKg, location, source, validFrom, validTo, closePreviousActive = true }) => {
  const material = await prisma.material.findUnique({
    where: { id: materialId }
  });

  if (!material) {
    throw new ApiError(404, `Material with ID '${materialId}' not found`);
  }

  const effectiveFrom = validFrom || new Date();

  // If this is a new open-ended active price (validTo is null), close previous active price
  // for the same material and location by updating its validTo to effectiveFrom.
  // This preserves the full historical ledger rather than overwriting.
  if (!validTo && closePreviousActive) {
    await prisma.price.updateMany({
      where: {
        materialId,
        location,
        validTo: null,
        validFrom: { lt: effectiveFrom }
      },
      data: {
        validTo: effectiveFrom
      }
    });
  }

  const newPrice = await prisma.price.create({
    data: {
      materialId,
      pricePerKg,
      location,
      source,
      validFrom: effectiveFrom,
      validTo: validTo || null
    },
    include: {
      material: {
        select: {
          id: true,
          name: true,
          code: true,
          unit: true
        }
      }
    }
  });

  return {
    id: newPrice.id,
    materialId: newPrice.materialId,
    materialName: newPrice.material.name,
    materialCode: newPrice.material.code,
    unit: newPrice.material.unit,
    pricePerKg: parseFloat(newPrice.pricePerKg.toString()),
    location: newPrice.location,
    source: newPrice.source,
    validFrom: newPrice.validFrom,
    validTo: newPrice.validTo,
    createdAt: newPrice.createdAt,
    updatedAt: newPrice.updatedAt
  };
};

/**
 * Update an existing price record (Admin only)
 */
const updatePrice = async (id, updateData) => {
  const price = await prisma.price.findUnique({
    where: { id },
    include: {
      material: {
        select: {
          id: true,
          name: true,
          code: true,
          unit: true
        }
      }
    }
  });

  if (!price) {
    throw new ApiError(404, `Price record with ID '${id}' not found`);
  }

  const updatedPrice = await prisma.price.update({
    where: { id },
    data: updateData,
    include: {
      material: {
        select: {
          id: true,
          name: true,
          code: true,
          unit: true
        }
      }
    }
  });

  return {
    id: updatedPrice.id,
    materialId: updatedPrice.materialId,
    materialName: updatedPrice.material.name,
    materialCode: updatedPrice.material.code,
    unit: updatedPrice.material.unit,
    pricePerKg: parseFloat(updatedPrice.pricePerKg.toString()),
    location: updatedPrice.location,
    source: updatedPrice.source,
    validFrom: updatedPrice.validFrom,
    validTo: updatedPrice.validTo,
    createdAt: updatedPrice.createdAt,
    updatedAt: updatedPrice.updatedAt
  };
};

module.exports = {
  getPricesByMaterialId,
  createPrice,
  updatePrice
};
