const ApiError = require('../utils/apiError');

/**
 * Validate materialId route parameter
 */
const validateMaterialIdParam = (req, res, next) => {
  const { materialId } = req.params;
  if (!materialId || typeof materialId !== 'string' || materialId.trim().length === 0) {
    return next(new ApiError(400, 'A valid materialId parameter is required'));
  }
  req.params.materialId = materialId.trim();
  next();
};

/**
 * Validate price id route parameter
 */
const validatePriceIdParam = (req, res, next) => {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return next(new ApiError(400, 'A valid price ID parameter is required'));
  }
  req.params.id = id.trim();
  next();
};

/**
 * Validate price creation payload
 */
const validateCreatePrice = (req, res, next) => {
  const { materialId, pricePerKg, location, source, validFrom, validTo } = req.body;

  if (!materialId || typeof materialId !== 'string' || materialId.trim().length === 0) {
    return next(new ApiError(400, 'A valid materialId is required'));
  }

  const parsedPrice = parseFloat(pricePerKg);
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return next(new ApiError(400, 'pricePerKg must be a positive numeric value'));
  }

  if (!location || typeof location !== 'string' || location.trim().length < 2) {
    return next(new ApiError(400, 'location is required and must be at least 2 characters'));
  }

  if (!source || typeof source !== 'string' || source.trim().length < 2) {
    return next(new ApiError(400, 'source is required and must be at least 2 characters'));
  }

  let fromDate = new Date();
  if (validFrom) {
    fromDate = new Date(validFrom);
    if (isNaN(fromDate.getTime())) {
      return next(new ApiError(400, 'validFrom must be a valid ISO date'));
    }
  }

  let toDate = null;
  if (validTo) {
    toDate = new Date(validTo);
    if (isNaN(toDate.getTime())) {
      return next(new ApiError(400, 'validTo must be a valid ISO date'));
    }
    if (toDate <= fromDate) {
      return next(new ApiError(400, 'validTo date must be strictly after validFrom date'));
    }
  }

  req.body.materialId = materialId.trim();
  req.body.pricePerKg = parsedPrice;
  req.body.location = location.trim();
  req.body.source = source.trim();
  req.body.validFrom = fromDate;
  req.body.validTo = toDate;

  next();
};

/**
 * Validate price update payload
 */
const validateUpdatePrice = (req, res, next) => {
  const { pricePerKg, location, source, validFrom, validTo } = req.body;

  if (pricePerKg === undefined && !location && !source && !validFrom && validTo === undefined) {
    return next(new ApiError(400, 'At least one field must be provided to update price'));
  }

  if (pricePerKg !== undefined) {
    const parsedPrice = parseFloat(pricePerKg);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return next(new ApiError(400, 'pricePerKg must be a positive numeric value'));
    }
    req.body.pricePerKg = parsedPrice;
  }

  if (location !== undefined) {
    if (typeof location !== 'string' || location.trim().length < 2) {
      return next(new ApiError(400, 'location must be at least 2 characters'));
    }
    req.body.location = location.trim();
  }

  if (source !== undefined) {
    if (typeof source !== 'string' || source.trim().length < 2) {
      return next(new ApiError(400, 'source must be at least 2 characters'));
    }
    req.body.source = source.trim();
  }

  let fromDate = undefined;
  if (validFrom !== undefined) {
    fromDate = new Date(validFrom);
    if (isNaN(fromDate.getTime())) {
      return next(new ApiError(400, 'validFrom must be a valid ISO date'));
    }
    req.body.validFrom = fromDate;
  }

  if (validTo !== undefined && validTo !== null) {
    const toDate = new Date(validTo);
    if (isNaN(toDate.getTime())) {
      return next(new ApiError(400, 'validTo must be a valid ISO date or null'));
    }
    if (fromDate && toDate <= fromDate) {
      return next(new ApiError(400, 'validTo date must be strictly after validFrom date'));
    }
    req.body.validTo = toDate;
  } else if (validTo === null) {
    req.body.validTo = null;
  }

  next();
};

module.exports = {
  validateMaterialIdParam,
  validatePriceIdParam,
  validateCreatePrice,
  validateUpdatePrice
};
