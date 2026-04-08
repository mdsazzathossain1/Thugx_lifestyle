const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp,
} = require('../controllers/authController');
const { getUserOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { validate, registerSchema, loginSchema } = require('../middleware/validation');

// Authentication routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/orders', protect, getUserOrders);

module.exports = router;
