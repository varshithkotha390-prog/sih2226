const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Handle user registration
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    return sendSuccess(res, 'User registered successfully', result, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user login
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    return sendSuccess(res, 'Login successful', result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve authenticated user profile
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Current user profile retrieved', req.user, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
