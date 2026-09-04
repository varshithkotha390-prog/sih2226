const express = require('express');
const {
  getPricesByMaterialId,
  createPrice,
  updatePrice
} = require('../controllers/price.controller');
const {
  validateMaterialIdParam,
  validatePriceIdParam,
  validateCreatePrice,
  validateUpdatePrice
} = require('../validators/price.validator');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

// Public endpoint: retrieve historical prices for a material
router.get('/:materialId', validateMaterialIdParam, getPricesByMaterialId);

// Admin-only protected endpoints
router.post('/', authenticate, authorize('ADMIN'), validateCreatePrice, createPrice);
router.patch('/:id', authenticate, authorize('ADMIN'), validatePriceIdParam, validateUpdatePrice, updatePrice);

module.exports = router;
