const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  displayName: { type: String, required: true, trim: true },
  bio: { type: String, default: '' },
  artStyles: [{ type: String }],
  city: { type: String, default: '' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  profileImage: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  socialLinks: {
    instagram: String,
    facebook: String,
    website: String
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isVerified: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

artistSchema.index({ city: 1 });
artistSchema.index({ artStyles: 1 });
artistSchema.index({ location: '2dsphere' });
artistSchema.index({ rating: -1 });

module.exports = mongoose.model('Artist', artistSchema);
