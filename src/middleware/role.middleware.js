const ApiError = require('../utils/apiError');

/**
 * Role-Based Access Control (RBAC) middleware factory
 * @param {...string} roles - Allowed roles e.g. 'COLLECTOR', 'RECYCLER', 'ADMIN'
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required prior to authorization'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access forbidden: requires one of the following roles: [${roles.join(', ')}]. Current role: ${req.user.role}`
        )
      );
    }

    next();
  };
};

module.exports = {
  authorize
};
