const express = require('express');
const artistController = require('../controllers/artistController');
const { protect, role } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

const router = express.Router();

router.get('/', artistController.getArtists);
router.get('/featured', artistController.getFeaturedArtists);
router.get('/nearby', artistController.getNearbyArtists);
router.get('/:id', artistController.getArtistById);

router.use(protect);
router.get('/me/profile', role('artist'), artistController.getMyArtistProfile);
router.put('/me/profile', role('artist'), artistController.updateArtistProfile);
router.post('/me/avatar', role('artist'), uploadSingle, artistController.uploadProfileImage);

module.exports = router;
