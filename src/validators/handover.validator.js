const { sendError } = require('../utils/apiResponse');

/**
 * Validates request payload for creating a handover record
 * POST /api/handover/create
 */
const validateCreateHandover = (req, res, next) => {
  const { transactionId, location } = req.body;
  const errors = [];

  if (!transactionId || typeof transactionId !== 'string' || transactionId.trim() === '') {
    errors.push('transactionId is required and must be a valid non-empty string.');
  }

  if (location !== undefined && (typeof location !== 'string' || location.trim() === '')) {
    errors.push('location must be a non-empty string if provided.');
  }

  if (errors.length > 0) {
    return sendError(res, 'Validation failed for handover creation', 400, errors);
  }

  req.body.transactionId = transactionId.trim();
  if (location) req.body.location = location.trim();

  next();
};

/**
 * Validates request payload for verifying a handover QR code
 * POST /api/handover/verify
 */
const validateVerifyHandover = (req, res, next) => {
  const { qrCode, qrIdentifier, handoverCode, verifiedWeight, verifiedMaterialId, notes, latitude, longitude } = req.body;
  const errors = [];

  // Accept qrCode, qrIdentifier, or handoverCode
  const code = qrCode || qrIdentifier || handoverCode;

  if (!code || typeof code !== 'string' || code.trim() === '') {
    errors.push('qrCode (or qrIdentifier / handoverCode) is required and must be a non-empty string.');
  }

  if (verifiedWeight !== undefined) {
    const parsedWeight = parseFloat(verifiedWeight);
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      errors.push('verifiedWeight must be a positive number greater than 0.');
    }
  }

  if (verifiedMaterialId !== undefined && (typeof verifiedMaterialId !== 'string' || verifiedMaterialId.trim() === '')) {
    errors.push('verifiedMaterialId must be a non-empty string if provided.');
  }

  if (notes !== undefined && typeof notes !== 'string') {
    errors.push('notes must be a string if provided.');
  }

  if (latitude !== undefined) {
    const lat = parseFloat(latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.push('latitude must be a valid number between -90 and 90.');
    }
  }

  if (longitude !== undefined) {
    const lng = parseFloat(longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.push('longitude must be a valid number between -180 and 180.');
    }
  }

  if (errors.length > 0) {
    return sendError(res, 'Validation failed for handover verification', 400, errors);
  }

  req.body.code = code.trim();
  if (verifiedWeight !== undefined) req.body.verifiedWeight = parseFloat(verifiedWeight);
  if (verifiedMaterialId) req.body.verifiedMaterialId = verifiedMaterialId.trim();
  if (notes) req.body.notes = notes.trim();
  if (latitude !== undefined) req.body.latitude = parseFloat(latitude);
  if (longitude !== undefined) req.body.longitude = parseFloat(longitude);

  next();
};

module.exports = {
  validateCreateHandover,
  validateVerifyHandover
};
