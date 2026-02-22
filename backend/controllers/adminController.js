const User = require('../models/User');
const Artist = require('../models/Artist');
const Artwork = require('../models/Artwork');
const CustomRequest = require('../models/CustomRequest');
const Review = require('../models/Review');

exports.getStats = async (req, res) => {
  try {
    const [usersCount, artistsCount, artworksCount, requestsCount] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Artist.countDocuments(),
      Artwork.countDocuments(),
      CustomRequest.countDocuments()
    ]);
    res.json({
      success: true,
      stats: { usersCount, artistsCount, artworksCount, requestsCount }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(100).lean();
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getArtists = async (req, res) => {
  try {
    const artists = await Artist.find().populate('user', 'name email avatar').sort({ createdAt: -1 }).limit(100).lean();
    res.json({ success: true, artists });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getArtworks = async (req, res) => {
  try {
    const artworks = await Artwork.find().populate('artist').sort({ createdAt: -1 }).limit(100).lean();
    res.json({ success: true, artworks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.banUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: true }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: false }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findByIdAndDelete(req.params.id);
    if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.featureArtist = async (req, res) => {
  try {
    const artist = await Artist.findByIdAndUpdate(
      req.params.id,
      { isFeatured: req.body.featured !== false },
      { new: true }
    );
    if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });
    res.json({ success: true, artist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
