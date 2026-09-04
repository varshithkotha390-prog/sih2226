const transactionService = require('../services/transaction.service');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * POST /api/transactions (Collector only)
 */
const createTransaction = async (req, res, next) => {
  try {
    const payload = {
      collectorId: req.user.id,
      lotId: req.body.lotId,
      recyclerId: req.body.recyclerId,
      offeredPrice: req.body.offeredPrice
    };

    const transaction = await transactionService.createTransaction(payload);
    return sendSuccess(res, 'Transaction initiated successfully', transaction, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/transactions/my-transactions
 */
const getMyTransactions = async (req, res, next) => {
  try {
    const transactions = await transactionService.getMyTransactions(req.user, req.query);
    return sendSuccess(res, 'Transactions retrieved successfully', transactions, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/transactions/:id
 */
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await transactionService.getTransactionById(req.params.id, req.user);
    return sendSuccess(res, 'Transaction retrieved successfully', transaction, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/transactions/:id/status
 */
const updateTransactionStatus = async (req, res, next) => {
  try {
    const updated = await transactionService.updateTransactionStatus(
      req.params.id,
      req.user,
      req.body.status,
      req.body.paymentStatus
    );
    return sendSuccess(res, 'Transaction status updated successfully', updated, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getMyTransactions,
  getTransactionById,
  updateTransactionStatus
};
