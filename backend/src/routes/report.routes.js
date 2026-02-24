const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// User routes
router.post('/', protect, reportController.createReport);
router.get('/my-reports', protect, reportController.getMyReports);
router.get('/:id', protect, reportController.getReportById);

// Admin routes
router.get('/', protect, authorize('admin'), reportController.getAllReports);
router.put('/:id/status', protect, authorize('admin'), reportController.updateReportStatus);
router.put('/:id/assign', protect, authorize('admin'), reportController.assignReport);
router.post('/:id/communicate', protect, authorize('admin'), reportController.addCommunication);

module.exports = router;
