const Notification = require('../models/Notification');

exports.getMyNotifications = async (req, res) => {
  try {
    const { limit = 20, unreadOnly } = req.query;
    let query = { user: req.user.id };
    if (unreadOnly === 'true') query.read = false;
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();
    const unreadCount = await Notification.countDocuments({ user: req.user.id, read: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, _id: req.params.id },
      { read: true, readAt: new Date() }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id },
      { read: true, readAt: new Date() }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
