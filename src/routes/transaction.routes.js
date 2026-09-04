const express = require('express');
const {
  createTransaction,
  getMyTransactions,
  getTransactionById,
  updateTransactionStatus
} = require('../controllers/transaction.controller');
const {
  validateTransactionId,
  validateCreateTransaction,
  validateUpdateTransactionStatus
} = require('../validators/transaction.validator');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

// All transaction operations require authentication
router.use(authenticate);

// Collector initiates transaction
router.post('/', authorize('COLLECTOR'), validateCreateTransaction, createTransaction);

// User's transactions list (Declared before /:id to prevent parameter capture)
router.get('/my-transactions', getMyTransactions);

// Single transaction details and status updates
router.get('/:id', validateTransactionId, getTransactionById);
router.patch('/:id/status', validateTransactionId, validateUpdateTransactionStatus, updateTransactionStatus);

module.exports = router;
