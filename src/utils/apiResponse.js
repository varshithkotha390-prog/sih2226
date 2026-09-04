/**
 * Standardized API Response Helpers
 */

const sendSuccess = (res, message = 'Success', data = null, statusCode = 200) => {
  const response = {
    success: true,
    message
  };
  if (data !== null && data !== undefined) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

const sendError = (res, message = 'An error occurred', statusCode = 500, error = null) => {
  const response = {
    success: false,
    message
  };
  if (error && process.env.NODE_ENV === 'development') {
    response.error = error;
  }
  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError
};
