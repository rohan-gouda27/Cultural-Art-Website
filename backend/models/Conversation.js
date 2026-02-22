const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, unique: true },
  finalizedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  finalizedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

conversationSchema.index({ conversationId: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
