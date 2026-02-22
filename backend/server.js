require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Message = require('./models/Message');
const { sanitizeMessage } = require('./utils/sanitizeMessage');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const artistRoutes = require('./routes/artists');
const artworkRoutes = require('./routes/artworks');
const liveProjectRoutes = require('./routes/liveProjects');
const customRequestRoutes = require('./routes/customRequests');
const reviewRoutes = require('./routes/reviews');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');

connectDB();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000' }
});

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/live-projects', liveProjectRoutes);
app.use('/api/custom-requests', customRequestRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('No token'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id).select('_id name avatar');
    socket.user = user;
    next();
  } catch (e) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  if (socket.user) socket.join(`user_${socket.user._id}`);
  socket.on('send_message', async (data) => {
    try {
      const { receiverId, content, orderRef } = data;
      const { sanitized, wasSanitized } = sanitizeMessage(content);
      const convId = [socket.user._id.toString(), receiverId].sort().join('_');
      const msg = await Message.create({
        conversationId: convId,
        sender: socket.user._id,
        receiver: receiverId,
        orderRef: orderRef || undefined,
        content: sanitized
      });
      const populated = await Message.findById(msg._id).populate('sender', 'name avatar');
      const payload = { message: populated, wasSanitized: wasSanitized || undefined, warning: wasSanitized ? 'Sharing contact details or negotiating price outside the platform is not allowed. Your message has been hidden.' : undefined };
      io.to(`user_${receiverId}`).emit('new_message', payload);
      socket.emit('new_message', payload);
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });
  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
