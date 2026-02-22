const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

const router = express.Router();

router.get('/profile/:id', userController.getProfile);
router.use(protect);
router.put('/profile', userController.updateProfile);
router.post('/avatar', uploadSingle, userController.uploadAvatar);
router.post('/save-artwork/:artworkId', userController.saveArtwork);
router.get('/saved-artworks', userController.getSavedArtworks);
router.post('/follow-artist/:artistId', userController.followArtist);

module.exports = router;
