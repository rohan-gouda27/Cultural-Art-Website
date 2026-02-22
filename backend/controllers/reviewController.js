const Review = require('../models/Review');
const Artist = require('../models/Artist');
const CustomRequest = require('../models/CustomRequest');
const Notification = require('../models/Notification');

exports.createReview = async (req, res) => {
  try {
    const { artistId, rating, comment, artworkOrdered, customRequestId } = req.body;
    const artist = await Artist.findById(artistId);
    if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });
    const existing = await Review.findOne({ user: req.user.id, artist: artistId });
    if (existing) return res.status(400).json({ success: false, message: 'You already reviewed this artist' });
    const review = await Review.create({
      user: req.user.id,
      artist: artistId,
      customRequest: customRequestId || undefined,
      rating: Number(rating),
      comment: comment || '',
      artworkOrdered: artworkOrdered || ''
    });
    const reviews = await Review.find({ artist: artistId });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await Artist.findByIdAndUpdate(artistId, { rating: Math.round(avg * 10) / 10, reviewCount: reviews.length });
    await Notification.create({
      user: artist.user,
      type: 'new_review',
      title: 'New review',
      body: `${req.user.name} left you a ${rating}-star review`,
      link: `/artist/reviews`
    });
    const populated = await Review.findById(review._id).populate('user', 'name avatar');
    res.status(201).json({ success: true, review: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getReviewsByArtist = async (req, res) => {
  try {
    const reviews = await Review.find({ artist: req.params.artistId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('artist')
      .populate('artist.user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
