const ApiError = require('../utils/apiError');

const ALLOWED_LOT_STATUSES = ['AVAILABLE', 'ASSIGNED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'];

/**
 * Validate lot ID route parameter
 */
const validateLotId = (req, res, next) => {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return next(new ApiError(400, 'A valid lot ID parameter is required'));
  }
  req.params.id = id.trim();
  next();
};

/**
 * Validate lot creation payload
 */
const validateCreateLot = (req, res, next) => {
  const materialId = req.body.material_id || req.body.materialId;
  const weight = req.body.weight;
  const imageUrl = req.body.image_url || req.body.imageUrl;
  const latitude = req.body.latitude;
  const longitude = req.body.longitude;
  const collectorLocation = req.body.collectorLocation || req.body.location;

  if (!materialId || typeof materialId !== 'string' || materialId.trim().length === 0) {
    return next(new ApiError(400, 'material_id is required'));
  }

  const parsedWeight = parseFloat(weight);
  if (isNaN(parsedWeight) || parsedWeight <= 0) {
    return next(new ApiError(400, 'Weight must be a positive number greater than 0'));
  }

  const parsedLat = parseFloat(latitude);
  const parsedLng = parseFloat(longitude);

  if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
    return next(new ApiError(400, 'Latitude must be a valid number between -90 and 90'));
  }

  if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
    return next(new ApiError(400, 'Longitude must be a valid number between -180 and 180'));
  }

  if (imageUrl && (typeof imageUrl !== 'string' || imageUrl.trim().length === 0)) {
    return next(new ApiError(400, 'image_url must be a valid string if provided'));
  }

  // Sanitize and set standardized keys
  req.body.materialId = materialId.trim();
  req.body.weight = parsedWeight;
  req.body.latitude = parsedLat;
  req.body.longitude = parsedLng;
  req.body.imageUrl = imageUrl ? imageUrl.trim() : null;
  req.body.collectorLocation = collectorLocation ? collectorLocation.trim() : `Lat: ${parsedLat.toFixed(4)}, Lng: ${parsedLng.toFixed(4)}`;

  next();
};

/**
 * Validate status update payload
 */
const validateUpdateLotStatus = (req, res, next) => {
  const { status } = req.body;

  if (!status || typeof status !== 'string' || !ALLOWED_LOT_STATUSES.includes(status.toUpperCase())) {
    return next(
      new ApiError(
        400,
        `Invalid status. Allowed values: ${ALLOWED_LOT_STATUSES.join(', ')}`
      )
    );
  }

  req.body.status = status.toUpperCase();
  next();
};

module.exports = {
  validateLotId,
  validateCreateLot,
  validateUpdateLotStatus
};
