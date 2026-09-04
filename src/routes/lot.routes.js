const express = require('express');
const {
  createLot,
  getMyLots,
  getLotById,
  updateLotStatus
} = require('../controllers/lot.controller');
const {
  validateLotId,
  validateCreateLot,
  validateUpdateLotStatus
} = require('../validators/lot.validator');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

// Authentication required for all lot operations
router.use(authenticate);

// Collector-specific operations
router.post('/', authorize('COLLECTOR'), validateCreateLot, createLot);
router.get('/my-lots', authorize('COLLECTOR'), getMyLots);

// Shared / authorized lot operations
router.get('/:id', validateLotId, getLotById);
router.patch('/:id/status', validateLotId, validateUpdateLotStatus, updateLotStatus);

module.exports = router;
