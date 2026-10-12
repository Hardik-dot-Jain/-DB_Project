const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

router.get('/', reportsController.getAllReports);
router.get('/sold-summary', reportsController.getSoldSummary);
router.get('/top-agents', reportsController.getTopAgents);
router.get('/price-stats', reportsController.getPriceStats);
router.get('/category-distribution', reportsController.getCategoryDistribution);
router.get('/agent-performance', reportsController.getAgentPerformance);
router.get('/full-transactions', reportsController.getFullTransactions);
router.get('/offer-success-rates', reportsController.getOfferRates);

module.exports = router;
