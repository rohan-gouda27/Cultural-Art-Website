const express = require('express');
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/conversations', messageController.getConversations);
router.get('/:otherUserId/status', messageController.getConversationStatus);
router.get('/:otherUserId', messageController.getMessages);
router.post('/', messageController.sendMessage);
router.post('/:otherUserId/finalize', messageController.finalizeChat);
router.put('/:otherUserId/read', messageController.markRead);

module.exports = router;
