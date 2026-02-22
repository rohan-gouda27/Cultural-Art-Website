const Artwork = require('../models/Artwork');
const Artist = require('../models/Artist');
const User = require('../models/User');
const { uploadImage } = require('../utils/uploadHelper');

exports.getArtworks = async (req, res) => {
  try {
    const { style, category, sort = 'recent', limit = 20, skip = 0 } = req.query;
    let query = {};
    if (style) query.style = new RegExp(style, 'i');
    if (category) query.category = category;
    let sortOption = { createdAt: -1 };
    if (sort === 'likes') sortOption = { likeCount: -1 };
    if (sort === 'orders') sortOption = { orderCount: -1 };
    const artworks = await Artwork.find(query)
      .populate('artist', 'displayName profileImage city artStyles')
      .populate('artist')
      .sort(sortOption)
      .limit(Number(limit))
      .skip(Number(skip))
      .lean();
    const total = await Artwork.countDocuments(query);
    res.json({ success: true, artworks, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getArtworkById = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id)
      .populate({ path: 'artist', populate: { path: 'user', select: 'name avatar' } });
    if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });
    res.json({ success: true, artwork });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createArtwork = async (req, res) => {
  try {
    const artist = await Artist.findOne({ user: req.user.id });
    if (!artist) return res.status(403).json({ success: false, message: 'Artist profile required' });
    let images = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const url = await uploadImage(file.buffer, 'artworks', file.originalname || 'artwork.jpg');
        images.push(url);
      }
    }
    if (req.body.images) {
      const urls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      images = images.concat(urls);
    }
    if (images.length === 0) return res.status(400).json({ success: false, message: 'At least one image required' });
    const artwork = await Artwork.create({
      artist: artist._id,
      title: req.body.title,
      description: req.body.description || '',
      images,
      style: req.body.style || 'Other',
      category: req.body.category || 'other',
      price: Number(req.body.price) || 0,
      isForSale: req.body.isForSale !== 'false'
    });
    const populated = await Artwork.findById(artwork._id).populate('artist');
    res.status(201).json({ success: true, artwork: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateArtwork = async (req, res) => {
  try {
    const artist = await Artist.findOne({ user: req.user.id });
    if (!artist) return res.status(403).json({ success: false, message: 'Not an artist' });
    const artwork = await Artwork.findOne({ _id: req.params.id, artist: artist._id });
    if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });
    const { title, description, style, category, price, isForSale } = req.body;
    if (req.files?.length) {
      for (const file of req.files) {
        const url = await uploadImage(file.buffer, 'artworks', file.originalname || 'artwork.jpg');
        artwork.images.push(url);
      }
    }
    if (title !== undefined) artwork.title = title;
    if (description !== undefined) artwork.description = description;
    if (style !== undefined) artwork.style = style;
    if (category !== undefined) artwork.category = category;
    if (price !== undefined) artwork.price = Number(price);
    if (isForSale !== undefined) artwork.isForSale = isForSale !== 'false';
    artwork.updatedAt = Date.now();
    await artwork.save();
    res.json({ success: true, artwork });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteArtwork = async (req, res) => {
  try {
    const artist = await Artist.findOne({ user: req.user.id });
    if (!artist) return res.status(403).json({ success: false, message: 'Not an artist' });
    const artwork = await Artwork.findOneAndDelete({ _id: req.params.id, artist: artist._id });
    if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });
    await User.updateMany({}, { $pull: { savedArtworks: artwork._id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.likeArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });
    const idx = artwork.likes.indexOf(req.user.id);
    if (idx === -1) {
      artwork.likes.push(req.user.id);
      artwork.likeCount = artwork.likes.length;
    } else {
      artwork.likes.splice(idx, 1);
      artwork.likeCount = artwork.likes.length;
    }
    await artwork.save();
    res.json({ success: true, likeCount: artwork.likeCount, liked: artwork.likes.includes(req.user.id) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTrendingStyles = async (req, res) => {
  try {
    const styles = [
      { name: 'Mandala', slug: 'mandala', count: 0 },
      { name: 'Portrait', slug: 'portrait', count: 0 },
      { name: 'Wall painting', slug: 'wall-painting', count: 0 },
      { name: 'Digital art', slug: 'digital-art', count: 0 },
      { name: 'Traditional art', slug: 'traditional', count: 0 }
    ];
    for (const s of styles) {
      s.count = await Artwork.countDocuments({ category: s.slug });
    }
    styles.sort((a, b) => b.count - a.count);
    const artworksByStyle = await Artwork.aggregate([
      { $group: { _id: '$category', sample: { $first: '$$ROOT' } } },
      { $limit: 5 }
    ]);
    const samples = await Artwork.populate(artworksByStyle.map(a => a.sample), { path: 'artist', select: 'displayName profileImage' });
    res.json({ success: true, styles, samples: samples.map(s => ({ ...s.toObject?.() || s, id: s._id })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
