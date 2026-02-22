const mongoose = require('mongoose');

const customRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' },
  artType: { type: String, required: true },
  budget: { type: Number, required: true },
  deadline: { type: Date, required: true },
  description: { type: String, required: true },
  referenceImages: [{ type: String }],
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'in-progress', 'completed', 'cancelled'], default: 'pending' },
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' },
  acceptedAt: { type: Date },
  finalPrice: { type: Number },
  orderCompletedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

customRequestSchema.index({ user: 1 });
customRequestSchema.index({ artist: 1 });
customRequestSchema.index({ status: 1 });
customRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CustomRequest', customRequestSchema);
