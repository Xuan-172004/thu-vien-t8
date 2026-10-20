const express = require('express');
const router = express.Router();
const DashboardController = require('../controller/dashboard.controller');
const { asyncHandler, authAdmin } = require('../auth/checkAuth');

router.get('/overview', authAdmin, asyncHandler(DashboardController.getOverview));
router.get('/charts', authAdmin, asyncHandler(DashboardController.getCharts));
router.get('/export', authAdmin, asyncHandler(DashboardController.getExportData));

module.exports = router;
