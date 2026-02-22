const Message = require('../models/Message');
const User = require('../models/User');
const Artist = require('../models/Artist');
const Notification = require('../models/Notification');

const getConversationId = (a, b) => [a, b].sort().join('_');

exports.getConversations = async (req, res) => {
  try {
    const messages = await Message.aggregate([
      { $match: { $or: [{ sender: req.user._id }, { receiver: req.user._id }] } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$conversationId', last: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$last' } },
      { $sort: { createdAt: -1 } },
      { $limit: 50 }
    ]);
    const ids = new Set();
    messages.forEach(m => {
      ids.add(m.sender.toString());
      ids.add(m.receiver.toString());
    });
    const users = await User.find({ _id: { $in: Array.from(ids) } }).select('name avatar').lean();
    const artists = await Artist.find({ user: { $in: Array.from(ids) } }).select('user displayName profileImage').lean();
    const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));
    const artistMap = Object.fromEntries(artists.map(a => [a.user.toString(), a]));
    const list = messages.map(m => {
      const otherId = m.sender.toString() === req.user.id ? m.receiver.toString() : m.sender.toString();
      const user = userMap[otherId];
      const artist = artistMap[otherId];
      return {
        _id: m._id,
        conversationId: m.conversationId,
        otherUser: user ? { ...user, displayName: artist?.displayName || user.name } : null,
        lastMessage: m.content,
        createdAt: m.createdAt,
        read: m.read,
        isSender: m.sender.toString() === req.user.id
      };
    });
    res.json({ success: true, conversations: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const convId = getConversationId(req.user.id, otherUserId);
    const messages = await Message.find({ conversationId: convId })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort({ createdAt: 1 });
    await Message.updateMany(
      { conversationId: convId, receiver: req.user.id },
      { read: true, readAt: new Date() }
    );
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, orderRef } = req.body;
    const convId = getConversationId(req.user.id, receiverId);
    const message = await Message.create({
      conversationId: convId,
      sender: req.user.id,
      receiver: receiverId,
      orderRef: orderRef || undefined,
      content
    });
    await Notification.create({
      user: receiverId,
      type: 'new_message',
      title: 'New message',
      body: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
      link: `/messages/${req.user.id}`
    });
    const populated = await Message.findById(message._id).populate('sender', 'name avatar');
    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const convId = getConversationId(req.user.id, otherUserId);
    await Message.updateMany(
      { conversationId: convId, receiver: req.user.id },
      { read: true, readAt: new Date() }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
