const Artist = require('../models/Artist');
const User = require('../models/User');
const Artwork = require('../models/Artwork');
const LiveProject = require('../models/LiveProject');
const Review = require('../models/Review');
const { uploadImage } = require('../utils/uploadHelper');

exports.getArtists = async (req, res) => {
  try {
    const { city, style, sort = 'recent', limit = 20, skip = 0 } = req.query;
    let query = {};
    if (city) query.city = new RegExp(city, 'i');
    if (style) query.artStyles = new RegExp(style, 'i');
    let sortOption = { createdAt: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'followers') sortOption = { followers: -1 };
    const artists = await Artist.find(query)
      .populate('user', 'name avatar city')
      .sort(sortOption)
      .limit(Number(limit))
      .skip(Number(skip))
      .lean();
    const total = await Artist.countDocuments(query);
    res.json({ success: true, artists, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getArtistById = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id).populate('user', 'name email avatar city');
    if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });
    const artworks = await Artwork.find({ artist: artist._id }).sort({ createdAt: -1 });
    const reviews = await Review.find({ artist: artist._id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, artist, artworks, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyArtistProfile = async (req, res) => {
  try {
    const artist = await Artist.findOne({ user: req.user.id }).populate('user', 'name email avatar city');
    if (!artist) return res.status(404).json({ success: false, message: 'Artist profile not found' });
    res.json({ success: true, artist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateArtistProfile = async (req, res) => {
  try {
    const { displayName, bio, artStyles, city, socialLinks } = req.body;
    const artist = await Artist.findOneAndUpdate(
      { user: req.user.id },
      {
        displayName: displayName || undefined,
        bio: bio !== undefined ? bio : undefined,
        artStyles: artStyles ? (Array.isArray(artStyles) ? artStyles : artStyles.split(',').map(s => s.trim())) : undefined,
        city: city !== undefined ? city : undefined,
        socialLinks: socialLinks || undefined,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('user', 'name avatar city');
    if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });
    await User.findByIdAndUpdate(req.user.id, { city: artist.city });
    res.json({ success: true, artist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image' });
    const url = await uploadImage(req.file.buffer, 'artists', req.file.originalname || 'profile.jpg');
    await Artist.findOneAndUpdate({ user: req.user.id }, { profileImage: url });
    res.json({ success: true, url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFeaturedArtists = async (req, res) => {
  try {
    const artists = await Artist.find({ isFeatured: true })
      .populate('user', 'name avatar city')
      .limit(10)
      .lean();
    res.json({ success: true, artists });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getNearbyArtists = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 50000 } = req.query;
    if (!lat || !lng) {
      const artists = await Artist.find().populate('user', 'name avatar city').limit(12).lean();
      return res.json({ success: true, artists });
    }
    const artists = await Artist.find({
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(maxDistance)
        }
      }
    }).populate('user', 'name avatar city').limit(12).lean();
    res.json({ success: true, artists });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
