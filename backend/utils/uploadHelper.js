const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

function isCloudinaryConfigured() {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

function getUniqueFilename(originalName) {
  const ext = path.extname(originalName) || '.jpg';
  const safeExt = /^\.(jpe?g|png|gif|webp)$/i.test(ext) ? ext : '.jpg';
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${safeExt}`;
}

/**
 * Save buffer to local uploads folder. Returns URL path like /uploads/filename.jpg
 */
function getBaseUrl() {
  return process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:5000';
}

function saveToLocal(buffer, folder, originalName = 'image.jpg') {
  ensureUploadsDir();
  const subDir = path.join(UPLOADS_DIR, folder);
  if (!fs.existsSync(subDir)) fs.mkdirSync(subDir, { recursive: true });
  const filename = getUniqueFilename(originalName);
  const filepath = path.join(subDir, filename);
  fs.writeFileSync(filepath, buffer);
  return `${getBaseUrl()}/uploads/${folder}/${filename}`;
}

/**
 * Upload buffer: use Cloudinary if configured, otherwise save locally.
 * Returns full URL for Cloudinary, or path like /uploads/folder/file for local.
 * For local, the app must serve static from /uploads (server.js).
 */
async function uploadImage(buffer, folder, originalName = 'image.jpg') {
  if (isCloudinaryConfigured()) {
    const cloudinary = require('../config/cloudinary');
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: `cultural-art/${folder}` }, (err, res) => {
          if (err) reject(err);
          else resolve(res.secure_url);
        })
        .end(buffer);
    });
  }
  return saveToLocal(buffer, folder, originalName);
}

module.exports = { uploadImage, isCloudinaryConfigured, saveToLocal };
