const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  images: [{ type: String, required: true }],
  style: { type: String, required: true },
  category: { type: String, enum: ['mandala', 'portrait', 'wall-painting', 'digital-art', 'traditional', 'other'], default: 'other' },
  price: { type: Number, default: 0 },
  isForSale: { type: Boolean, default: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likeCount: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

artworkSchema.index({ artist: 1 });
artworkSchema.index({ style: 1 });
artworkSchema.index({ category: 1 });
artworkSchema.index({ likeCount: -1 });
artworkSchema.index({ orderCount: -1 });
artworkSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Artwork', artworkSchema);
