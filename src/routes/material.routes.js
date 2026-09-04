const express = require('express');
const {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial
} = require('../controllers/material.controller');
const {
  validateMaterialId,
  validateCreateMaterial,
  validateUpdateMaterial
} = require('../validators/material.validator');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

// Public endpoints
router.get('/', getAllMaterials);
router.get('/:id', validateMaterialId, getMaterialById);

// Admin-only protected endpoints
router.post('/', authenticate, authorize('ADMIN'), validateCreateMaterial, createMaterial);
router.patch('/:id', authenticate, authorize('ADMIN'), validateMaterialId, validateUpdateMaterial, updateMaterial);
router.delete('/:id', authenticate, authorize('ADMIN'), validateMaterialId, deleteMaterial);

module.exports = router;
