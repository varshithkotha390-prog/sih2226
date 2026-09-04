const recyclerService = require('../services/recycler.service');
const recommendationService = require('../services/recommendation.service');
const { sendSuccess } = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

/**
 * GET /api/recyclers/recommended?lotId=<LOT_ID>
 */
const getRecommendedRecyclers = async (req, res, next) => {
  try {
    const lotId = req.query.lotId || req.query.lot_id;
    if (!lotId || typeof lotId !== 'string' || lotId.trim().length === 0) {
      throw new ApiError(400, 'Query parameter lotId is required to generate recommendations');
    }

    const result = await recommendationService.recommendRecyclersForLot(lotId.trim(), req.query);
    return sendSuccess(res, 'Recommended recyclers calculated successfully', result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/recyclers
 */
const getAllRecyclers = async (req, res, next) => {
  try {
    const recyclers = await recyclerService.getAllRecyclers(req.query);
    return sendSuccess(res, 'Recyclers retrieved successfully', recyclers, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/recyclers/:id
 */
const getRecyclerById = async (req, res, next) => {
  try {
    const recycler = await recyclerService.getRecyclerById(req.params.id);
    return sendSuccess(res, 'Recycler retrieved successfully', recycler, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/recyclers/:id/materials
 */
const getRecyclerMaterials = async (req, res, next) => {
  try {
    const materials = await recyclerService.getRecyclerMaterials(req.params.id);
    return sendSuccess(res, 'Recycler supported materials retrieved successfully', materials, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/recyclers (Admin only)
 */
const createRecycler = async (req, res, next) => {
  try {
    const recycler = await recyclerService.createRecycler(req.body);
    return sendSuccess(res, 'Recycler profile created successfully', recycler, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/recyclers/:id (Admin only)
 */
const updateRecycler = async (req, res, next) => {
  try {
    const recycler = await recyclerService.updateRecycler(req.params.id, req.body);
    return sendSuccess(res, 'Recycler profile updated successfully', recycler, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRecyclers,
  getRecyclerById,
  getRecyclerMaterials,
  getRecommendedRecyclers,
  createRecycler,
  updateRecycler
};
