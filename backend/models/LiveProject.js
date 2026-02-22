const mongoose = require('mongoose');

const liveProjectSchema = new mongoose.Schema({
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  images: [{ type: String }],
  status: { type: String, enum: ['sketch', 'in-progress', 'final', 'completed'], default: 'sketch' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likeCount: { type: Number, default: 0 },
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

liveProjectSchema.index({ artist: 1 });
liveProjectSchema.index({ status: 1 });
liveProjectSchema.index({ createdAt: -1 });

module.exports = mongoose.model('LiveProject', liveProjectSchema);
