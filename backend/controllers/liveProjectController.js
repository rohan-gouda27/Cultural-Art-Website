const LiveProject = require('../models/LiveProject');
const Artist = require('../models/Artist');
const { uploadImage } = require('../utils/uploadHelper');

exports.getLiveProjects = async (req, res) => {
  try {
    const { status, limit = 20, skip = 0 } = req.query;
    let query = {};
    if (status) query.status = status;
    const projects = await LiveProject.find(query)
      .populate('artist')
      .populate('artist.user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .lean();
    const total = await LiveProject.countDocuments(query);
    res.json({ success: true, projects, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getLiveProjectById = async (req, res) => {
  try {
    const project = await LiveProject.findById(req.params.id)
      .populate('artist')
      .populate('artist.user', 'name avatar')
      .populate('comments.user', 'name avatar');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createLiveProject = async (req, res) => {
  try {
    const artist = await Artist.findOne({ user: req.user.id });
    if (!artist) return res.status(403).json({ success: false, message: 'Artist profile required' });
    let images = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const url = await uploadImage(file.buffer, 'live-projects', file.originalname || 'image.jpg');
        images.push(url);
      }
    }
    const project = await LiveProject.create({
      artist: artist._id,
      title: req.body.title,
      description: req.body.description || '',
      images,
      status: req.body.status || 'sketch',
      progress: Number(req.body.progress) || 0
    });
    const populated = await LiveProject.findById(project._id).populate('artist');
    res.status(201).json({ success: true, project: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateLiveProject = async (req, res) => {
  try {
    const artist = await Artist.findOne({ user: req.user.id });
    if (!artist) return res.status(403).json({ success: false, message: 'Not an artist' });
    const project = await LiveProject.findOne({ _id: req.params.id, artist: artist._id });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    const { title, description, status, progress } = req.body;
    if (req.files?.length) {
      for (const file of req.files) {
        const url = await uploadImage(file.buffer, 'live-projects', file.originalname || 'image.jpg');
        project.images.push(url);
      }
    }
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;
    if (progress !== undefined) project.progress = Number(progress);
    project.updatedAt = Date.now();
    await project.save();
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.likeLiveProject = async (req, res) => {
  try {
    const project = await LiveProject.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    const idx = project.likes.indexOf(req.user.id);
    if (idx === -1) {
      project.likes.push(req.user.id);
      project.likeCount = project.likes.length;
    } else {
      project.likes.splice(idx, 1);
      project.likeCount = project.likes.length;
    }
    await project.save();
    res.json({ success: true, likeCount: project.likeCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const project = await LiveProject.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    project.comments.push({ user: req.user.id, text: req.body.text });
    await project.save();
    const populated = await LiveProject.findById(project._id).populate('comments.user', 'name avatar');
    const comment = populated.comments[populated.comments.length - 1];
    res.status(201).json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
