const express = require('express');
const artworkController = require('../controllers/artworkController');
const { protect, role } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

const router = express.Router();

router.get('/', artworkController.getArtworks);
router.get('/trending-styles', artworkController.getTrendingStyles);
router.get('/:id', artworkController.getArtworkById);

router.use(protect);
router.post('/', role('artist'), uploadMultiple, artworkController.createArtwork);
router.put('/:id', role('artist'), uploadMultiple, artworkController.updateArtwork);
router.delete('/:id', role('artist'), artworkController.deleteArtwork);
router.post('/:id/like', artworkController.likeArtwork);

module.exports = router;
