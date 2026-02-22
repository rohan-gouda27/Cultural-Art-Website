const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(protect, adminOnly);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/artists', adminController.getArtists);
router.get('/artworks', adminController.getArtworks);
router.post('/users/:id/ban', adminController.banUser);
router.post('/users/:id/unban', adminController.unbanUser);
router.delete('/artworks/:id', adminController.deleteArtwork);
router.put('/artists/:id/feature', adminController.featureArtist);

module.exports = router;
