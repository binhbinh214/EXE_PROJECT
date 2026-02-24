const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/chat', protect, chatbotController.chat);
router.get('/history', protect, chatbotController.getHistory);
router.delete('/history', protect, chatbotController.clearHistory);

module.exports = router;
