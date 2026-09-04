const ApiError = require('../utils/apiError');
const { sendError } = require('../utils/apiResponse');

/**
 * Handle 404 Not Found routes
 */
const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Resource not found: ${req.originalUrl}`));
};

/**
 * Centralized global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return sendError(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
};

module.exports = {
  notFoundHandler,
  errorHandler
};
