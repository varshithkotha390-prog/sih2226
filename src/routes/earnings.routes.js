const express = require('express');
const earningsController = require('../controllers/earnings.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { Role } = require('@prisma/client');

const router = express.Router();

/**
 * @route   GET /api/earnings/me
 * @desc    Retrieve calculated dashboard earnings for the authenticated collector
 * @access  Private (Collector only)
 */
router.get(
  '/me',
  authenticate,
  authorize(Role.COLLECTOR),
  earningsController.getMyEarnings
);

module.exports = router;
