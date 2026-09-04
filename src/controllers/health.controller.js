/**
 * Health check controller
 */
const getHealthStatus = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Kabadiwala Connect API is running"
  });
};

module.exports = {
  getHealthStatus
};
