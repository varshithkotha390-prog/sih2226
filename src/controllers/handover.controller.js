const handoverService = require('../services/handover.service');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Initiate handover and generate unique QR code
 * POST /api/handover/create
 */
const create = async (req, res, next) => {
  try {
    const { transactionId, location } = req.body;
    const result = await handoverService.createHandover({
      transactionId,
      location,
      user: req.user
    });

    const statusCode = result.isExisting ? 200 : 201;
    const message = result.isExisting
      ? 'Active handover QR code retrieved'
      : 'Handover record created successfully. Display QR code to recycler.';

    return sendSuccess(res, message, result, statusCode);
  } catch (error) {
    next(error);
  }
};

/**
 * Verify handover QR code presented by collector to recycler
 * POST /api/handover/verify
 */
const verify = async (req, res, next) => {
  try {
    const { code, verifiedWeight, verifiedMaterialId, notes } = req.body;
    const result = await handoverService.verifyHandover({
      code,
      verifiedWeight,
      verifiedMaterialId,
      notes,
      user: req.user
    });

    return sendSuccess(res, result.message, result, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve handover details by ID or QR Identifier
 * GET /api/handover/:id
 */
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const handover = await handoverService.getHandoverById({
      id,
      user: req.user
    });

    return sendSuccess(res, 'Handover record retrieved successfully', handover, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  verify,
  getById
};
