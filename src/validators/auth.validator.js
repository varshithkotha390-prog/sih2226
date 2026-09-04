const ApiError = require('../utils/apiError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES = ['COLLECTOR', 'RECYCLER', 'ADMIN'];

const validateRegister = (req, res, next) => {
  const { name, email, password, role, phone } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return next(new ApiError(400, 'Name is required and must be at least 2 characters'));
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return next(new ApiError(400, 'A valid email address is required'));
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return next(new ApiError(400, 'Password is required and must be at least 6 characters'));
  }

  if (role && !ALLOWED_ROLES.includes(role)) {
    return next(new ApiError(400, `Invalid role. Allowed roles: ${ALLOWED_ROLES.join(', ')}`));
  }

  if (phone && (typeof phone !== 'string' || phone.trim().length < 8)) {
    return next(new ApiError(400, 'Phone number must be at least 8 digits if provided'));
  }

  // Sanitize body
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  if (role) req.body.role = role;
  if (phone) req.body.phone = phone.trim();

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return next(new ApiError(400, 'A valid email address is required'));
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    return next(new ApiError(400, 'Password is required'));
  }

  req.body.email = email.trim().toLowerCase();

  next();
};

module.exports = {
  validateRegister,
  validateLogin
};
