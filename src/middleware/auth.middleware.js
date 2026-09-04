const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const config = require('../config/env');
const ApiError = require('../utils/apiError');
const { sanitizeUser } = require('../services/auth.service');

/**
 * Authentication middleware to verify Bearer JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication token missing or invalid format');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new ApiError(401, 'Authentication token missing');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Authentication token has expired. Please log in again');
      }
      throw new ApiError(401, 'Invalid authentication token');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        recyclerProfile: true
      }
    });

    if (!user) {
      throw new ApiError(401, 'The account associated with this token no longer exists');
    }

    req.user = sanitizeUser(user);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate
};
