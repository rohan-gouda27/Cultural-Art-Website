const express = require('express');
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

const router = express.Router();
router.use(protect);
router.post('/suggest-style', uploadSingle, aiController.suggestStyle);

module.exports = router;
