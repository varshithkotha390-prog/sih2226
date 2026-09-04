const express = require('express');
const {
  getAllRecyclers,
  getRecyclerById,
  getRecyclerMaterials,
  getRecommendedRecyclers,
  createRecycler,
  updateRecycler
} = require('../controllers/recycler.controller');
const {
  validateRecyclerId,
  validateCreateRecycler,
  validateUpdateRecycler
} = require('../validators/recycler.validator');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

// Public endpoints
router.get('/', getAllRecyclers);
router.get('/recommended', getRecommendedRecyclers);
router.get('/:id', validateRecyclerId, getRecyclerById);
router.get('/:id/materials', validateRecyclerId, getRecyclerMaterials);

// Admin-only protected endpoints
router.post('/', authenticate, authorize('ADMIN'), validateCreateRecycler, createRecycler);
router.patch('/:id', authenticate, authorize('ADMIN'), validateRecyclerId, validateUpdateRecycler, updateRecycler);

module.exports = router;
