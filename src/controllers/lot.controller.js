const lotService = require('../services/lot.service');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * POST /api/lots (Collector only)
 */
const createLot = async (req, res, next) => {
  try {
    const lotData = {
      collectorId: req.user.id,
      materialId: req.body.materialId,
      weight: req.body.weight,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      imageUrl: req.body.imageUrl,
      collectorLocation: req.body.collectorLocation
    };

    const createdLot = await lotService.createLot(lotData);
    return sendSuccess(res, 'E-waste lot created successfully', createdLot, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/lots/my-lots (Collector only)
 */
const getMyLots = async (req, res, next) => {
  try {
    const lots = await lotService.getMyLots(req.user.id, req.query);
    return sendSuccess(res, 'Collector lots retrieved successfully', lots, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/lots/:id
 */
const getLotById = async (req, res, next) => {
  try {
    const lot = await lotService.getLotById(req.params.id, req.user);
    return sendSuccess(res, 'Lot retrieved successfully', lot, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/lots/:id/status
 */
const updateLotStatus = async (req, res, next) => {
  try {
    const updated = await lotService.updateLotStatus(req.params.id, req.user, req.body.status);
    return sendSuccess(res, 'Lot status updated successfully', updated, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLot,
  getMyLots,
  getLotById,
  updateLotStatus
};
