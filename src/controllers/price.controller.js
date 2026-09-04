const priceService = require('../services/price.service');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * GET /api/prices/:materialId
 */
const getPricesByMaterialId = async (req, res, next) => {
  try {
    const prices = await priceService.getPricesByMaterialId(req.params.materialId, req.query);
    return sendSuccess(res, 'Price records retrieved successfully', prices, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/prices (Admin only)
 */
const createPrice = async (req, res, next) => {
  try {
    const price = await priceService.createPrice(req.body);
    return sendSuccess(res, 'Price record created successfully', price, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/prices/:id (Admin only)
 */
const updatePrice = async (req, res, next) => {
  try {
    const price = await priceService.updatePrice(req.params.id, req.body);
    return sendSuccess(res, 'Price record updated successfully', price, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPricesByMaterialId,
  createPrice,
  updatePrice
};
