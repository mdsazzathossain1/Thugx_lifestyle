const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
// Load environment variables from the server folder .env explicitly
require('dotenv').config({ path: path.join(__dirname, '.env') });

const seedLocalStore = require('./db/seed');

// Security middleware imports
const {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  apiLimiter,
  sanitizeInput,
  preventSQLInjection,
  securityHeaders,
  getCorsOptions,
  helmetOptions,
} = require('./middleware/security');

// Route imports
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const { validateCoupon } = require('./controllers/couponController');

const app = express();

// Initialize local data store and seed default data
seedLocalStore().then(() => {
  console.log('Local data store ready');
}).catch(err => console.error('Seed error:', err.message));

// Try MongoDB connection optionally (won't crash if unavailable)
try {
  const connectDB = require('./config/db');
  connectDB().catch(err => console.log('MongoDB unavailable, using local store'));
} catch (e) {
  console.log('Running with local JSON store (no MongoDB)');
}

// ─── SECURITY MIDDLEWARE ──────────────────────────────────────────────────
// Helmet - Set security HTTP headers
app.use(helmet(helmetOptions));

// CORS - Cross-Origin Resource Sharing with strict configuration
app.use(cors(getCorsOptions()));

// Additional security headers
app.use(securityHeaders);

// Body parsing with protection
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization and validation
app.use(sanitizeInput);
app.use(preventSQLInjection);

// ─── RATE LIMITING ────────────────────────────────────────────────────────
// Apply general rate limiter to all API routes
app.use('/api/', generalLimiter);

// Apply stricter rate limiting to auth routes
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', passwordResetLimiter);
app.use('/api/auth/reset-password', passwordResetLimiter);
app.use('/api/auth/resend-verification', authLimiter);

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Public coupon validation
app.post('/api/coupons/validate', validateCoupon);

// Public settings (delivery charges, payment methods for checkout)
const { getSettings } = require('./controllers/settingsController');
app.get('/api/settings', getSettings);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Frontend is deployed separately on Vercel - backend is API only
// Do NOT serve static frontend files here

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large' });
    }
    return res.status(400).json({ message: err.message });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
