const express = require('express');
const { register, login, getMe } = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../validators/auth.validator');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Public auth endpoints
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected auth endpoints
router.get('/me', authenticate, getMe);

module.exports = router;
