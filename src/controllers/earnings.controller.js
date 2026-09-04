const earningsService = require('../services/earnings.service');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * GET /api/earnings/me
 * Retrieve real-time calculated earnings analytics for the authenticated collector
 */
const getMyEarnings = async (req, res, next) => {
  try {
    const earningsData = await earningsService.getCollectorEarnings(req.user.id, req.user);
    return sendSuccess(res, 'Collector earnings calculated successfully', earningsData, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyEarnings
};
