const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth.middleware');

// Public routes
router.get('/', contentController.getContent);
router.get('/featured', contentController.getFeaturedContent);
router.get('/:id', contentController.getContentById);

// Protected routes
router.post('/:id/complete', protect, contentController.recordCompletion);
router.post('/:id/like', protect, contentController.likeContent);
router.post('/:id/rate', protect, contentController.rateContent);

// Provider routes (can create content)
router.post('/', protect, authorize('admin', 'doctor', 'healer'), contentController.createContent);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), contentController.getAllContentAdmin);
router.put('/:id', protect, authorize('admin'), contentController.updateContent);
router.put('/:id/status', protect, authorize('admin'), contentController.updateContentStatus);
router.delete('/:id', protect, authorize('admin'), contentController.deleteContent);

module.exports = router;
