const express = require('express');
const liveProjectController = require('../controllers/liveProjectController');
const { protect, role } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

const router = express.Router();

router.get('/', liveProjectController.getLiveProjects);
router.get('/:id', liveProjectController.getLiveProjectById);

router.use(protect);
router.post('/', role('artist'), uploadMultiple, liveProjectController.createLiveProject);
router.put('/:id', role('artist'), uploadMultiple, liveProjectController.updateLiveProject);
router.post('/:id/like', liveProjectController.likeLiveProject);
router.post('/:id/comments', liveProjectController.addComment);

module.exports = router;
