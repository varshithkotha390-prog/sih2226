const materialService = require('../services/material.service');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * GET /api/materials
 */
const getAllMaterials = async (req, res, next) => {
  try {
    const materials = await materialService.getAllMaterials(req.query);
    return sendSuccess(res, 'Materials retrieved successfully', materials, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/materials/:id
 */
const getMaterialById = async (req, res, next) => {
  try {
    const material = await materialService.getMaterialById(req.params.id);
    return sendSuccess(res, 'Material retrieved successfully', material, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/materials (Admin only)
 */
const createMaterial = async (req, res, next) => {
  try {
    const material = await materialService.createMaterial(req.body);
    return sendSuccess(res, 'Material created successfully', material, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/materials/:id (Admin only)
 */
const updateMaterial = async (req, res, next) => {
  try {
    const material = await materialService.updateMaterial(req.params.id, req.body);
    return sendSuccess(res, 'Material updated successfully', material, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/materials/:id (Admin only)
 */
const deleteMaterial = async (req, res, next) => {
  try {
    const result = await materialService.deleteMaterial(req.params.id);
    return sendSuccess(res, 'Material deleted successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial
};
