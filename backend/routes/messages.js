const express = require('express');
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/conversations', messageController.getConversations);
router.get('/:otherUserId', messageController.getMessages);
router.post('/', messageController.sendMessage);
router.put('/:otherUserId/read', messageController.markRead);

module.exports = router;
