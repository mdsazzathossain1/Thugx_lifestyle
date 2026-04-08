const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendVerificationEmail, sendPasswordResetEmail, sendPasswordChangedEmail, sendOTPEmail } = require('../utils/emailService');
const crypto = require('crypto');

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Password strength check (at least 8 chars, 1 uppercase, 1 number, 1 special char)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)',
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      isRegistered: true,
      emailVerified: false,
    });

    // Send OTP verification (replace link flow)
    try {
      const otp = user.generateOTP('registration', parseInt(process.env.OTP_EXPIRES_MINUTES || '10', 10));
      await User.findByIdAndUpdate(user._id, {
        otpHash: user.otpHash,
        otpExpires: user.otpExpires,
        otpPurpose: user.otpPurpose,
        otpAttempts: user.otpAttempts,
      });
      await sendOTPEmail(user.email, otp, 'registration', user.name);
    } catch (emailError) {
      console.error('OTP sending failed:', emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
      _id: user._id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/auth/verify-email
const verifyEmail = async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ message: 'Email and verification token are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Validate token
    if (!user.isVerificationTokenValid(token)) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Mark email as verified
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
      { new: true }
    );

    res.json({
      message: 'Email verified successfully! You can now log in.',
      _id: updatedUser._id,
      email: updatedUser.email,
      emailVerified: updatedUser.emailVerified,
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/auth/resend-verification
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new OTP verification code
    const otp = user.generateOTP('registration', parseInt(process.env.OTP_EXPIRES_MINUTES || '10', 10));
    await User.findByIdAndUpdate(user._id, {
      otpHash: user.otpHash,
      otpExpires: user.otpExpires,
      otpPurpose: user.otpPurpose,
      otpAttempts: user.otpAttempts,
    });

    // Send OTP
    try {
      await sendOTPEmail(user.email, otp, 'registration', user.name);
    } catch (emailError) {
      console.error('OTP sending failed:', emailError);
      return res.status(500).json({ message: 'Failed to send verification code' });
    }

    res.json({
      message: 'Verification email resent. Please check your inbox.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email, isRegistered: true });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in',
        requiresVerification: true,
        email: user.email,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      emailVerified: user.emailVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists (security best practice)
      return res.json({
        message: 'If an account exists with this email, you will receive a password reset link',
      });
    }

    // Generate OTP for password reset (replace link flow)
    try {
      const otp = user.generateOTP('reset', parseInt(process.env.OTP_EXPIRES_MINUTES || '10', 10));
      await User.findByIdAndUpdate(user._id, {
        otpHash: user.otpHash,
        otpExpires: user.otpExpires,
        otpPurpose: user.otpPurpose,
        otpAttempts: user.otpAttempts,
      });
      await sendOTPEmail(user.email, otp, 'reset', user.name);
    } catch (emailError) {
      console.error('OTP sending failed:', emailError);
      return res.status(500).json({ message: 'Failed to send password reset code' });
    }

    res.json({
      message: 'If an account exists with this email, you will receive a password reset code',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'Email, token, and new password are required' });
    }

    // Password strength check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)',
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate reset token
    if (!user.isPasswordResetTokenValid(token)) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    // Hash new password
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
      { new: true }
    );

    // Send confirmation email
    try {
      await sendPasswordChangedEmail(updatedUser.email, updatedUser.name);
    } catch (emailError) {
      console.error('Confirmation email failed:', emailError);
      // Don't fail the reset if confirmation email fails
    }

    res.json({
      message: 'Password reset successful! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    if (req.body.address) {
      user.address = { ...user.address?.length ? JSON.parse(JSON.stringify(user.address)) : {}, ...req.body.address };
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
      name: user.name,
      phone: user.phone,
      address: user.address,
    }, { new: true });

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
};

// POST /api/auth/send-otp
const sendOtp = async (req, res) => {
  try {
    const { email, type } = req.body; // type: 'reset' | 'registration'
    if (!email || !type) return res.status(400).json({ message: 'Email and type are required' });
    let user = await User.findOne({ email });
    if (!user) {
      if (type === 'registration') {
        return res.status(404).json({ message: 'User not found' });
      }
      // For forgot-password, keep generic response
      return res.json({ message: 'If an account exists with this email, you will receive a code' });
    }

    const otp = user.generateOTP(type, parseInt(process.env.OTP_EXPIRES_MINUTES || '10', 10));
    await User.findByIdAndUpdate(user._id, {
      otpHash: user.otpHash,
      otpExpires: user.otpExpires,
      otpPurpose: user.otpPurpose,
      otpAttempts: user.otpAttempts,
    });

    await sendOTPEmail(user.email, otp, type, user.name);
    res.json({ message: 'If an account exists with this email, you will receive a code' });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { email, type, otp, newPassword } = req.body;
    if (!email || !type || !otp) return res.status(400).json({ message: 'Email, type and otp are required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Validate OTP
    if (!user.isOTPValid(otp, type)) {
      const attempts = user.incrementOtpAttempts();
      await User.findByIdAndUpdate(user._id, { otpAttempts: user.otpAttempts });
      return res.status(400).json({ message: 'Invalid or expired code', attempts });
    }

    // OTP valid - perform action
    if (type === 'registration') {
      const updated = await User.findByIdAndUpdate(user._id, { emailVerified: true, otpHash: null, otpExpires: null, otpPurpose: null, otpAttempts: 0 }, { new: true });
      return res.json({ message: 'Email verified successfully', emailVerified: updated.emailVerified });
    }

    if (type === 'reset') {
      if (!newPassword) return res.status(400).json({ message: 'New password required for reset' });
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) return res.status(400).json({ message: 'Password does not meet requirements' });
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const updatedUser = await User.findByIdAndUpdate(user._id, { password: hashedPassword, otpHash: null, otpExpires: null, otpPurpose: null, otpAttempts: 0 }, { new: true });
      try { await sendPasswordChangedEmail(updatedUser.email, updatedUser.name); } catch (e) { console.error('Confirmation email failed:', e); }
      return res.json({ message: 'Password reset successful' });
    }

    res.status(400).json({ message: 'Unknown OTP type' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// export new handlers
module.exports.sendOtp = sendOtp;
module.exports.verifyOtp = verifyOtp;
