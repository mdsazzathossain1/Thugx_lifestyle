/**
 * Local model wrappers using the JSON file store.
 * These provide the same API as Mongoose models so controllers don't change.
 */
const { getCollection, generateId } = require('./store');
const bcrypt = require('bcryptjs');

// ─── Admin Model ─────────────────────────────────────────────────────────────
const adminCol = getCollection('admins');

const Admin = {
  async findOne(query) {
    return adminCol.findOne(query);
  },
  async findById(id) {
    return adminCol.findById(id);
  },
  async create(data) {
    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(data.password, salt);
    return adminCol.create({ ...data, password: hashed });
  },
  async countDocuments(q) { return adminCol.countDocuments(q); },
};

// ─── User Model ──────────────────────────────────────────────────────────────
const userCol = getCollection('users');
const crypto = require('crypto');

const User = {
  find(query) { return userCol.find(query); },
  async findOne(query) {
    const user = await userCol.findOne(query);
    return user ? _attachUserMethods(user) : null;
  },
  async findById(id) {
    const user = await userCol.findById(id);
    return user ? _attachUserMethods(user) : null;
  },
  async create(data) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(data.password, salt);
    const userData = {
      ...data,
      password: hashed,
      emailVerified: false,
      verificationToken: crypto.randomBytes(32).toString('hex'),
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
    const user = await userCol.create(userData);
    return _attachUserMethods(user);
  },
  async countDocuments(q) { return userCol.countDocuments(q); },
  async findByIdAndUpdate(id, data, opts) {
    const user = await userCol.findByIdAndUpdate(id, data, opts);
    return user ? _attachUserMethods(user) : null;
  },
};

// Helper function to attach methods to user objects
function _attachUserMethods(user) {
  if (!user) return null;

  // Compare password method
  user.comparePassword = async function (inputPassword) {
    return await bcrypt.compare(inputPassword, this.password);
  };

  // Generate password reset token
  user.generatePasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    return resetToken; // Return unhashed token to send to user
  };

  // Generate email verification token
  user.generateVerificationToken = function () {
    const token = crypto.randomBytes(32).toString('hex');
    this.verificationToken = crypto.createHash('sha256').update(token).digest('hex');
    this.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    return token; // Return unhashed token to send to user
  };

  // Check if email verification token is valid
  user.isVerificationTokenValid = function (token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    return (
      hashedToken === this.verificationToken &&
      new Date() < new Date(this.verificationTokenExpires)
    );
  };

  // Check if password reset token is valid
  user.isPasswordResetTokenValid = function (token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    return (
      hashedToken === this.resetToken &&
      new Date() < new Date(this.resetTokenExpires)
    );
  };

  // Generate short numeric OTP (for reset or verification) and store hashed
  user.generateOTP = function (purpose = 'reset', minutes = 10) {
    const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
    this.otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    this.otpExpires = new Date(Date.now() + minutes * 60 * 1000);
    this.otpPurpose = purpose; // e.g., 'reset' or 'registration'
    this.otpAttempts = 0;
    return otp; // raw OTP to send via email
  };

  // Verify provided OTP against stored hash
  user.isOTPValid = function (otp, purpose) {
    if (!this.otpHash || !this.otpExpires) return false;
    if (purpose && this.otpPurpose !== purpose) return false;
    if (new Date() > new Date(this.otpExpires)) return false;
    const hashed = crypto.createHash('sha256').update(otp).digest('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(hashed), Buffer.from(this.otpHash));
    } catch (e) {
      return false;
    }
  };

  // Increment OTP attempts and optionally clear on too many attempts
  user.incrementOtpAttempts = function () {
    this.otpAttempts = (this.otpAttempts || 0) + 1;
    return this.otpAttempts;
  };

  // Clear OTP fields after use or expiry
  user.clearOtp = function () {
    this.otpHash = null;
    this.otpExpires = null;
    this.otpPurpose = null;
    this.otpAttempts = 0;
  };

  return user;
}

// ─── Product Model ───────────────────────────────────────────────────────────
const productCol = getCollection('products');

const Product = {
  find(query) { return productCol.find(query); },   // sync — returns chainable QueryResult
  async findOne(query) { return productCol.findOne(query); },
  async findById(id) { return productCol.findById(id); },
  async create(data) { return productCol.create(data); },
  async findByIdAndUpdate(id, data, opts) { return productCol.findByIdAndUpdate(id, data, opts); },
  async findByIdAndDelete(id) { return productCol.findByIdAndDelete(id); },
  async countDocuments(q) { return productCol.countDocuments(q || {}); },
  async aggregate(pipeline) { return productCol.aggregate(pipeline); },
};

// ─── Order Model ─────────────────────────────────────────────────────────────
const orderCol = getCollection('orders');

const Order = {
  find(query) { return orderCol.find(query); },   // sync — returns chainable QueryResult
  async findOne(query) { return orderCol.findOne(query); },
  async findById(id) { return orderCol.findById(id); },
  async create(data) {
    // Ensure required defaults
    const defaults = {
      statusHistory: [{ status: data.status || 'pending', timestamp: new Date().toISOString(), updatedBy: 'system' }],
      paymentDetails: { transactionId: '', transactionProof: '', submittedAt: null },
      adminNotes: '',
    };
    return orderCol.create({ ...defaults, ...data });
  },
  async findByIdAndUpdate(id, data, opts) { return orderCol.findByIdAndUpdate(id, data, opts); },
  async countDocuments(q) { return orderCol.countDocuments(q || {}); },
  async aggregate(pipeline) { return orderCol.aggregate(pipeline); },
};

// ─── Coupon Model ────────────────────────────────────────────────────────────
const couponCol = getCollection('coupons');

const Coupon = {
  find(query) { return couponCol.find(query); },
  async findOne(query) { return couponCol.findOne(query); },
  async findById(id) { return couponCol.findById(id); },
  async create(data) { return couponCol.create(data); },
  async findByIdAndUpdate(id, data, opts) { return couponCol.findByIdAndUpdate(id, data, opts); },
  async findByIdAndDelete(id) { return couponCol.findByIdAndDelete(id); },
  async countDocuments(q) { return couponCol.countDocuments(q || {}); },
};

// ─── Settings Model ──────────────────────────────────────────────────────────
const settingsCol = getCollection('settings');

const Settings = {
  async get() {
    return settingsCol.findOne({});
  },
  async upsert(data) {
    const existing = await settingsCol.findOne({});
    if (existing) {
      return settingsCol.findByIdAndUpdate(existing._id, data, { new: true });
    }
    return settingsCol.create(data);
  },
};

// ─── Finance Model (costs and revenues) ─────────────────────────────────────
const financeCol = getCollection('finances');

const Finance = {
  find(query) { return financeCol.find(query); },
  async findOne(query) { return financeCol.findOne(query); },
  async findById(id) { return financeCol.findById(id); },
  async create(data) { return financeCol.create(data); },
  async findByIdAndUpdate(id, data, opts) { return financeCol.findByIdAndUpdate(id, data, opts); },
  async findByIdAndDelete(id) { return financeCol.findByIdAndDelete(id); },
  async countDocuments(q) { return financeCol.countDocuments(q || {}); },
  async aggregate(pipeline) { return financeCol.aggregate(pipeline); },
};

module.exports = { Admin, User, Product, Order, Coupon, Settings };
// export Finance if present
try { module.exports.Finance = Finance; } catch (e) { /* noop */ }
