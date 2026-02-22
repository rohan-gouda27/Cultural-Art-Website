const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Artist = require('../models/Artist');
const { validationResult } = require('express-validator');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password, role: role || 'user' });
    if (role === 'artist') {
      await Artist.create({ user: user._id, displayName: name, city: user.city || '' });
    }
    const token = signToken(user._id);
    const u = await User.findById(user._id).select('-password');
    res.status(201).json({ success: true, token, user: u });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    if (user.isBanned) return res.status(403).json({ success: false, message: 'Account suspended' });
    const token = signToken(user._id);
    user.password = undefined;
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('savedArtworks', 'title images style');
    let artist = null;
    if (user.role === 'artist') {
      artist = await Artist.findOne({ user: user._id });
    }
    res.json({ success: true, user, artist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
