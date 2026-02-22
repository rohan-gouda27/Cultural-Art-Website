const User = require('../models/User');
const Artist = require('../models/Artist');
const Artwork = require('../models/Artwork');
const { uploadImage } = require('../utils/uploadHelper');
const { validationResult } = require('express-validator');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    let artist = null;
    if (user.role === 'artist') artist = await Artist.findOne({ user: user._id });
    res.json({ success: true, user, artist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, city } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name || req.user.name, city: city || req.user.city, updatedAt: Date.now() },
      { new: true }
    ).select('-password');
    if (req.user.role === 'artist') {
      const artist = await Artist.findOne({ user: req.user.id });
      if (artist) {
        await Artist.findByIdAndUpdate(artist._id, {
          displayName: name || artist.displayName,
          city: city || artist.city,
          updatedAt: Date.now()
        });
      }
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image' });
    const url = await uploadImage(req.file.buffer, 'avatars', req.file.originalname || 'avatar.jpg');
    await User.findByIdAndUpdate(req.user.id, { avatar: url });
    res.json({ success: true, url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.saveArtwork = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const idx = user.savedArtworks.indexOf(req.params.artworkId);
    if (idx === -1) user.savedArtworks.push(req.params.artworkId);
    else user.savedArtworks.splice(idx, 1);
    await user.save();
    res.json({ success: true, savedArtworks: user.savedArtworks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSavedArtworks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedArtworks');
    res.json({ success: true, artworks: user.savedArtworks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.followArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.artistId);
    if (!artist) return res.status(404).json({ success: false, message: 'Artist not found' });
    const idx = artist.followers.indexOf(req.user.id);
    if (idx === -1) artist.followers.push(req.user.id);
    else artist.followers.splice(idx, 1);
    await artist.save();
    res.json({ success: true, followers: artist.followers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
