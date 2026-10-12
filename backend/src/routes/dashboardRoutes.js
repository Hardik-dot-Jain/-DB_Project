const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/', dashboardController.getDashboard);
router.get('/admin', dashboardController.getAdminDashboard);
router.get('/agent', dashboardController.getAgentDashboard);
router.get('/client', dashboardController.getClientDashboard);

module.exports = router;
