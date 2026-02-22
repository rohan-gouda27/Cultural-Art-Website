const CustomRequest = require('../models/CustomRequest');
const Artist = require('../models/Artist');
const Notification = require('../models/Notification');
const { uploadImage } = require('../utils/uploadHelper');

exports.createRequest = async (req, res) => {
  try {
    let referenceImages = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const url = await uploadImage(file.buffer, 'references', file.originalname || 'ref.jpg');
        referenceImages.push(url);
      }
    }
    if (req.body.referenceImages) {
      const urls = Array.isArray(req.body.referenceImages) ? req.body.referenceImages : [req.body.referenceImages];
      referenceImages = referenceImages.concat(urls);
    }
    const customRequest = await CustomRequest.create({
      user: req.user.id,
      artist: req.body.artistId || undefined,
      artType: req.body.artType,
      budget: Number(req.body.budget),
      deadline: new Date(req.body.deadline),
      description: req.body.description,
      referenceImages
    });
    const populated = await CustomRequest.findById(customRequest._id).populate('user', 'name avatar');
    if (req.body.artistId) {
      const artist = await Artist.findById(req.body.artistId);
      if (artist?.user) {
        await Notification.create({
          user: artist.user,
          type: 'new_request',
          title: 'New custom art request',
          body: `${req.user.name} sent a custom art request`,
          link: `/artist/requests/${customRequest._id}`
        });
      }
    }
    res.status(201).json({ success: true, request: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await CustomRequest.find({ user: req.user.id })
      .populate('artist')
      .populate('acceptedBy')
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getArtistRequests = async (req, res) => {
  try {
    const artist = await Artist.findOne({ user: req.user.id });
    if (!artist) return res.status(403).json({ success: false, message: 'Not an artist' });
    const requests = await CustomRequest.find({
      $or: [{ artist: artist._id }, { acceptedBy: artist._id }, { status: 'pending' }]
    })
      .populate('user', 'name avatar city')
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const artist = await Artist.findOne({ user: req.user.id });
    if (!artist) return res.status(403).json({ success: false, message: 'Not an artist' });
    const customRequest = await CustomRequest.findById(req.params.id);
    if (!customRequest) return res.status(404).json({ success: false, message: 'Request not found' });
    if (customRequest.status !== 'pending') return res.status(400).json({ success: false, message: 'Request already processed' });
    customRequest.status = 'accepted';
    customRequest.acceptedBy = artist._id;
    customRequest.acceptedAt = new Date();
    customRequest.finalPrice = Number(req.body.finalPrice) || customRequest.budget;
    customRequest.artist = artist._id;
    await customRequest.save();
    await Notification.create({
      user: customRequest.user,
      type: 'order_accepted',
      title: 'Your custom request was accepted',
      body: `An artist accepted your request`,
      link: `/dashboard/requests/${customRequest._id}`
    });
    res.json({ success: true, request: customRequest });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const artist = await Artist.findOne({ user: req.user.id });
    if (!artist) return res.status(403).json({ success: false, message: 'Not an artist' });
    const customRequest = await CustomRequest.findOne({ _id: req.params.id, artist: artist._id });
    if (!customRequest) {
      const anyReq = await CustomRequest.findById(req.params.id);
      if (anyReq && anyReq.status === 'pending') {
        anyReq.status = 'rejected';
        await anyReq.save();
        return res.json({ success: true, request: anyReq });
      }
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    customRequest.status = 'rejected';
    await customRequest.save();
    res.json({ success: true, request: customRequest });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const artist = await Artist.findOne({ user: req.user.id });
    if (!artist) return res.status(403).json({ success: false, message: 'Not an artist' });
    const customRequest = await CustomRequest.findOne({ _id: req.params.id, acceptedBy: artist._id });
    if (!customRequest) return res.status(404).json({ success: false, message: 'Request not found' });
    const { status } = req.body;
    if (['in-progress', 'completed'].includes(status)) {
      customRequest.status = status;
      if (status === 'completed') {
        customRequest.orderCompletedAt = new Date();
        const amount = customRequest.finalPrice || customRequest.budget;
        await Artist.findByIdAndUpdate(artist._id, { $inc: { totalEarnings: amount } });
        await Notification.create({
          user: customRequest.user,
          type: 'order_completed',
          title: 'Your order is completed',
          body: 'The artist marked your order as completed',
          link: `/dashboard/requests/${customRequest._id}`
        });
      }
    }
    await customRequest.save();
    res.json({ success: true, request: customRequest });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const customRequest = await CustomRequest.findById(req.params.id)
      .populate('user', 'name avatar city')
      .populate('artist')
      .populate('acceptedBy');
    if (!customRequest) return res.status(404).json({ success: false, message: 'Request not found' });
    const isOwner = customRequest.user._id.toString() === req.user?.id;
    const artist = await Artist.findOne({ user: req.user?.id });
    const isArtist = artist && (customRequest.artist?.toString() === artist._id.toString() || customRequest.acceptedBy?._id?.toString() === artist._id.toString());
    if (!isOwner && !isArtist) return res.status(403).json({ success: false, message: 'Forbidden' });
    res.json({ success: true, request: customRequest });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
