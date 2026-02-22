const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/artist/:artistId', reviewController.getReviewsByArtist);

router.use(protect);
router.post('/', reviewController.createReview);
router.get('/my', reviewController.getMyReviews);

module.exports = router;
