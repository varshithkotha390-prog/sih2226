const ApiError = require('../utils/apiError');

/**
 * Validate latitude (-90 to 90) and longitude (-180 to 180)
 */
const isValidCoordinates = (lat, lng) => {
  const numLat = parseFloat(lat);
  const numLng = parseFloat(lng);
  if (isNaN(numLat) || isNaN(numLng)) return false;
  return numLat >= -90 && numLat <= 90 && numLng >= -180 && numLng <= 180;
};

/**
 * Validate recycler ID route parameter
 */
const validateRecyclerId = (req, res, next) => {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return next(new ApiError(400, 'A valid recycler ID parameter is required'));
  }
  req.params.id = id.trim();
  next();
};

/**
 * Validate creation of recycler profile
 */
const validateCreateRecycler = (req, res, next) => {
  const {
    name,
    address,
    latitude,
    longitude,
    contactInfo,
    authorizedStatus,
    authorizationId,
    pickupAvailable,
    supportedMaterialIds,
    userId,
    email,
    password
  } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return next(new ApiError(400, 'Recycler name is required and must be at least 2 characters'));
  }

  if (!address || typeof address !== 'string' || address.trim().length < 3) {
    return next(new ApiError(400, 'Address is required and must be at least 3 characters'));
  }

  if (latitude === undefined || longitude === undefined || !isValidCoordinates(latitude, longitude)) {
    return next(new ApiError(400, 'Valid latitude (-90 to 90) and longitude (-180 to 180) coordinates are required'));
  }

  if (!contactInfo || typeof contactInfo !== 'string' || contactInfo.trim().length < 3) {
    return next(new ApiError(400, 'Contact information is required'));
  }

  // Must have an associated user: either existing userId or email+password
  if (!userId && (!email || !password)) {
    return next(new ApiError(400, 'Either an existing userId or email and password for a new recycler user is required'));
  }

  if (supportedMaterialIds && !Array.isArray(supportedMaterialIds)) {
    return next(new ApiError(400, 'supportedMaterialIds must be an array of material IDs'));
  }

  req.body.name = name.trim();
  req.body.address = address.trim();
  req.body.latitude = parseFloat(latitude);
  req.body.longitude = parseFloat(longitude);
  req.body.contactInfo = contactInfo.trim();
  req.body.authorizedStatus = Boolean(authorizedStatus);
  req.body.authorizationId = authorizationId ? authorizationId.trim() : null;
  req.body.pickupAvailable = Boolean(pickupAvailable);
  if (supportedMaterialIds) req.body.supportedMaterialIds = supportedMaterialIds;

  next();
};

/**
 * Validate update of recycler profile
 */
const validateUpdateRecycler = (req, res, next) => {
  const {
    name,
    address,
    latitude,
    longitude,
    contactInfo,
    authorizedStatus,
    authorizationId,
    pickupAvailable,
    supportedMaterialIds
  } = req.body;

  const hasField =
    name !== undefined ||
    address !== undefined ||
    latitude !== undefined ||
    longitude !== undefined ||
    contactInfo !== undefined ||
    authorizedStatus !== undefined ||
    authorizationId !== undefined ||
    pickupAvailable !== undefined ||
    supportedMaterialIds !== undefined;

  if (!hasField) {
    return next(new ApiError(400, 'At least one field must be provided for update'));
  }

  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
    return next(new ApiError(400, 'Recycler name must be at least 2 characters'));
  }

  if (address !== undefined && (typeof address !== 'string' || address.trim().length < 3)) {
    return next(new ApiError(400, 'Address must be at least 3 characters'));
  }

  if (latitude !== undefined || longitude !== undefined) {
    const lat = latitude !== undefined ? latitude : 0;
    const lng = longitude !== undefined ? longitude : 0;
    if (latitude !== undefined && (isNaN(parseFloat(latitude)) || parseFloat(latitude) < -90 || parseFloat(latitude) > 90)) {
      return next(new ApiError(400, 'Latitude must be a valid number between -90 and 90'));
    }
    if (longitude !== undefined && (isNaN(parseFloat(longitude)) || parseFloat(longitude) < -180 || parseFloat(longitude) > 180)) {
      return next(new ApiError(400, 'Longitude must be a valid number between -180 and 180'));
    }
  }

  if (contactInfo !== undefined && (typeof contactInfo !== 'string' || contactInfo.trim().length < 3)) {
    return next(new ApiError(400, 'Contact information must be at least 3 characters'));
  }

  if (supportedMaterialIds !== undefined && !Array.isArray(supportedMaterialIds)) {
    return next(new ApiError(400, 'supportedMaterialIds must be an array of material IDs'));
  }

  if (name) req.body.name = name.trim();
  if (address) req.body.address = address.trim();
  if (latitude !== undefined) req.body.latitude = parseFloat(latitude);
  if (longitude !== undefined) req.body.longitude = parseFloat(longitude);
  if (contactInfo) req.body.contactInfo = contactInfo.trim();
  if (authorizedStatus !== undefined) req.body.authorizedStatus = Boolean(authorizedStatus);
  if (authorizationId !== undefined) req.body.authorizationId = authorizationId ? authorizationId.trim() : null;
  if (pickupAvailable !== undefined) req.body.pickupAvailable = Boolean(pickupAvailable);

  next();
};

module.exports = {
  validateRecyclerId,
  validateCreateRecycler,
  validateUpdateRecycler
};
