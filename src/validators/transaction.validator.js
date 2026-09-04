const ApiError = require('../utils/apiError');

const ALLOWED_TX_STATUSES = [
  'PENDING',
  'ACCEPTED',
  'PICKUP_SCHEDULED',
  'HANDED_OVER',
  'COMPLETED',
  'CANCELLED',
  'REJECTED'
];

const ALLOWED_PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'ESCROWED'];

/**
 * Validate transaction ID route parameter
 */
const validateTransactionId = (req, res, next) => {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return next(new ApiError(400, 'A valid transaction ID parameter is required'));
  }
  req.params.id = id.trim();
  next();
};

/**
 * Validate transaction creation payload
 */
const validateCreateTransaction = (req, res, next) => {
  const lotId = req.body.lotId || req.body.lot_id;
  const recyclerId = req.body.recyclerId || req.body.recycler_id;
  const offeredPrice = req.body.offeredPrice || req.body.offered_price;

  if (!lotId || typeof lotId !== 'string' || lotId.trim().length === 0) {
    return next(new ApiError(400, 'lotId is required'));
  }

  if (!recyclerId || typeof recyclerId !== 'string' || recyclerId.trim().length === 0) {
    return next(new ApiError(400, 'recyclerId is required'));
  }

  if (offeredPrice !== undefined) {
    const parsedPrice = parseFloat(offeredPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return next(new ApiError(400, 'offeredPrice must be a positive numeric value'));
    }
    req.body.offeredPrice = parsedPrice;
  }

  req.body.lotId = lotId.trim();
  req.body.recyclerId = recyclerId.trim();

  next();
};

/**
 * Validate transaction status update payload
 */
const validateUpdateTransactionStatus = (req, res, next) => {
  const { status, paymentStatus } = req.body;

  if (!status || typeof status !== 'string' || !ALLOWED_TX_STATUSES.includes(status.toUpperCase())) {
    return next(
      new ApiError(
        400,
        `Invalid transaction status. Allowed values: ${ALLOWED_TX_STATUSES.join(', ')}`
      )
    );
  }

  if (paymentStatus && (!ALLOWED_PAYMENT_STATUSES.includes(paymentStatus.toUpperCase()))) {
    return next(
      new ApiError(
        400,
        `Invalid payment status. Allowed values: ${ALLOWED_PAYMENT_STATUSES.join(', ')}`
      )
    );
  }

  req.body.status = status.toUpperCase();
  if (paymentStatus) req.body.paymentStatus = paymentStatus.toUpperCase();

  next();
};

module.exports = {
  validateTransactionId,
  validateCreateTransaction,
  validateUpdateTransactionStatus
};
