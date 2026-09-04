const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const config = require('../config/env');
const ApiError = require('../utils/apiError');

/**
 * Remove sensitive credentials from user entity
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

/**
 * Generate signed JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn
    }
  );
};

/**
 * Register a new user
 */
const registerUser = async ({ name, email, phone, password, role }) => {
  // Check for existing user by email or phone
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        ...(phone ? [{ phone }] : [])
      ]
    }
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new ApiError(409, 'An account with this email already exists');
    }
    if (phone && existingUser.phone === phone) {
      throw new ApiError(409, 'An account with this phone number already exists');
    }
  }

  // Hash password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Persist user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      passwordHash,
      role: role || 'COLLECTOR'
    },
    include: {
      recyclerProfile: true
    }
  });

  const token = generateToken(user);

  return {
    user: sanitizeUser(user),
    token
  };
};

/**
 * Authenticate user credentials and return JWT
 */
const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      recyclerProfile: true
    }
  });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user);

  return {
    user: sanitizeUser(user),
    token
  };
};

/**
 * Retrieve user by ID
 */
const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      recyclerProfile: true
    }
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return sanitizeUser(user);
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  sanitizeUser,
  generateToken
};
