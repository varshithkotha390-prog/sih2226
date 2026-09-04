const express = require('express');
const handoverController = require('../controllers/handover.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { Role } = require('@prisma/client');
const {
  validateCreateHandover,
  validateVerifyHandover
} = require('../validators/handover.validator');

const router = express.Router();

/**
 * @route   POST /api/handover/create
 * @desc    Generate a unique handover QR code for an accepted transaction
 * @access  Private (Collector, Admin)
 */
router.post(
  '/create',
  authenticate,
  authorize(Role.COLLECTOR, Role.ADMIN),
  validateCreateHandover,
  handoverController.create
);

/**
 * @route   POST /api/handover/verify
 * @desc    Recycler scans and verifies the collector's handover QR code
 * @access  Private (Recycler, Admin)
 */
router.post(
  '/verify',
  authenticate,
  authorize(Role.RECYCLER, Role.ADMIN),
  validateVerifyHandover,
  handoverController.verify
);

/**
 * @route   GET /api/handover/:id
 * @desc    Get handover record details by handover ID or QR identifier
 * @access  Private (Participants: Collector, Recycler, Admin)
 */
router.get(
  '/:id',
  authenticate,
  handoverController.getById
);

module.exports = router;
