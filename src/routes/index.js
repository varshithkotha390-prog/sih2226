const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const materialRoutes = require('./material.routes');
const priceRoutes = require('./price.routes');
const recyclerRoutes = require('./recycler.routes');
const lotRoutes = require('./lot.routes');
const transactionRoutes = require('./transaction.routes');
const handoverRoutes = require('./handover.routes');
const earningsRoutes = require('./earnings.routes');
const docsRoutes = require('./docs.routes');

const router = express.Router();

// Mount routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/materials', materialRoutes);
router.use('/prices', priceRoutes);
router.use('/recyclers', recyclerRoutes);
router.use('/lots', lotRoutes);
router.use('/transactions', transactionRoutes);
router.use('/handover', handoverRoutes);
router.use('/earnings', earningsRoutes);
router.use('/docs', docsRoutes);

module.exports = router;
