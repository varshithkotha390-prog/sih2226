const ApiError = require('../utils/apiError');

/**
 * Validate material ID parameter
 */
const validateMaterialId = (req, res, next) => {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return next(new ApiError(400, 'A valid material ID parameter is required'));
  }
  req.params.id = id.trim();
  next();
};

/**
 * Validate material creation payload
 */
const validateCreateMaterial = (req, res, next) => {
  const { name, code, description, unit } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return next(new ApiError(400, 'Material name is required and must be at least 2 characters'));
  }

  if (code && (typeof code !== 'string' || code.trim().length < 2)) {
    return next(new ApiError(400, 'Material code must be at least 2 characters if provided'));
  }

  if (unit && (typeof unit !== 'string' || unit.trim().length === 0)) {
    return next(new ApiError(400, 'Unit must be a valid non-empty string'));
  }

  req.body.name = name.trim();
  if (code) req.body.code = code.trim().toUpperCase();
  if (description) req.body.description = description.trim();
  req.body.unit = unit ? unit.trim().toLowerCase() : 'kg';

  next();
};

/**
 * Validate material update payload
 */
const validateUpdateMaterial = (req, res, next) => {
  const { name, code, description, unit } = req.body;

  if (!name && !code && description === undefined && !unit) {
    return next(new ApiError(400, 'At least one field (name, code, description, unit) must be provided for update'));
  }

  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
    return next(new ApiError(400, 'Material name must be at least 2 characters'));
  }

  if (code !== undefined && (typeof code !== 'string' || code.trim().length < 2)) {
    return next(new ApiError(400, 'Material code must be at least 2 characters'));
  }

  if (unit !== undefined && (typeof unit !== 'string' || unit.trim().length === 0)) {
    return next(new ApiError(400, 'Unit must be a valid string'));
  }

  if (name) req.body.name = name.trim();
  if (code) req.body.code = code.trim().toUpperCase();
  if (description !== undefined) req.body.description = description ? description.trim() : null;
  if (unit) req.body.unit = unit.trim().toLowerCase();

  next();
};

module.exports = {
  validateMaterialId,
  validateCreateMaterial,
  validateUpdateMaterial
};
