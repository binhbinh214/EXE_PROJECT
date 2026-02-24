const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/doctors', userController.getDoctors);
router.get('/healers', userController.getHealers);
router.get('/provider/:id', userController.getProviderById);

// Protected routes
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.put('/availability', protect, authorize('doctor', 'healer'), userController.updateAvailability);
router.get('/balance', protect, userController.getBalance);

// Admin routes
router.get('/', protect, authorize('admin'), userController.getAllUsers);
router.get('/:id', protect, authorize('admin'), userController.getUserById);
router.put('/:id/role', protect, authorize('admin'), userController.updateUserRole);
router.put('/:id/suspend', protect, authorize('admin'), userController.toggleSuspendUser);
router.put('/:id/verify-profile', protect, authorize('admin'), userController.verifyProviderProfile);
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

module.exports = router;
