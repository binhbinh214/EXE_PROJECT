const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, messageController.sendMessage);
router.get('/conversations', protect, messageController.getConversations);
router.get('/conversation/:userId', protect, messageController.getConversation);
router.get('/unread-count', protect, messageController.getUnreadCount);
router.put('/read/:userId', protect, messageController.markAsRead);
router.delete('/:id', protect, messageController.deleteMessage);

module.exports = router;
