const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { Readable } = require('stream');

// ─── Cloudinary (production) or local disk (development) ─────────────────────
let cloudinary;
// Trim stray leading '=' in case user pasted 'name=value' into Railway value field
const CLOUDINARY_CLOUD_NAME = (process.env.CLOUDINARY_CLOUD_NAME || '').replace(/^=+/, '').trim();
const CLOUDINARY_API_KEY    = (process.env.CLOUDINARY_API_KEY    || '').replace(/^=+/, '').trim();
const CLOUDINARY_API_SECRET = (process.env.CLOUDINARY_API_SECRET || '').replace(/^=+/, '').trim();
const useCloudinary = !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);

if (useCloudinary) {
  cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key:    CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
  console.log(`☁️  Using Cloudinary for media uploads (cloud: ${CLOUDINARY_CLOUD_NAME})`);
} else {
  console.log('📁 Using local disk for media uploads (set CLOUDINARY_* env vars for production)');
}

// Upload a buffer to Cloudinary, returns the secure URL
const uploadToCloudinary = (buffer, mimetype, originalname) => {
  return new Promise((resolve, reject) => {
    const folder = 'thugx-lifestyle/products';
    const resourceType = mimetype.startsWith('video/') ? 'video' : 'image';
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

// Always use memory storage so we can pipe to Cloudinary or write locally
const storage = useCloudinary
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      },
    });

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const allowedVideoTypes = ['video/mp4', 'video/webm'];
  if ([...allowedImageTypes, ...allowedVideoTypes].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP, GIF, MP4, WebM allowed.'), false);
  }
};

const uploadProduct = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024, files: 8 } });
const uploadProof   = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, WebP allowed.'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

module.exports = { uploadProduct, uploadProof, uploadToCloudinary, useCloudinary };

