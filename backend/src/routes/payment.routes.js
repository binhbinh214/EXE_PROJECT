const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Customer routes
router.post('/deposit', protect, paymentController.deposit);
router.post('/pay-appointment', protect, authorize('customer'), paymentController.payForAppointment);
router.get('/my-payments', protect, paymentController.getMyPayments);
router.get('/balance', protect, paymentController.getBalance);
router.get('/:id', protect, paymentController.getPaymentById);

// Admin routes
router.get('/', protect, authorize('admin'), paymentController.getAllPayments);
router.post('/:id/refund', protect, authorize('admin'), paymentController.processRefund);

module.exports = router;
