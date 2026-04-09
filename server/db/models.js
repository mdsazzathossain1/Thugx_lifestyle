/**
 * Mongoose schemas – single source of truth for all models.
 * Replaces the previous JSON file store wrappers.
 */
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');

// ─── Admin ───────────────────────────────────────────────────────────────────
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role:     { type: String, default: 'super_admin' },
}, { timestamps: true });

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);

// ─── User ────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:                     { type: String, required: true, trim: true },
  email:                    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:                 { type: String, required: true },
  phone:                    { type: String, default: '' },
  isRegistered:             { type: Boolean, default: true },
  emailVerified:            { type: Boolean, default: false },
  verificationToken:        String,
  verificationTokenExpires: Date,
  resetToken:               String,
  resetTokenExpires:        Date,
  otpHash:                  String,
  otpExpires:               Date,
  otpPurpose:               String,
  otpAttempts:              { type: Number, default: 0 },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000);
  return resetToken;
};

userSchema.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.verificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return token;
};

userSchema.methods.isVerificationTokenValid = function (token) {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  return hashed === this.verificationToken && new Date() < this.verificationTokenExpires;
};

userSchema.methods.isPasswordResetTokenValid = function (token) {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  return hashed === this.resetToken && new Date() < this.resetTokenExpires;
};

userSchema.methods.generateOTP = function (purpose = 'reset', minutes = 10) {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  this.otpHash    = crypto.createHash('sha256').update(otp).digest('hex');
  this.otpExpires = new Date(Date.now() + minutes * 60 * 1000);
  this.otpPurpose = purpose;
  this.otpAttempts = 0;
  return otp;
};

userSchema.methods.isOTPValid = function (otp, purpose) {
  if (!this.otpHash || !this.otpExpires) return false;
  if (purpose && this.otpPurpose !== purpose) return false;
  if (new Date() > this.otpExpires) return false;
  const hashed = crypto.createHash('sha256').update(otp).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hashed), Buffer.from(this.otpHash));
  } catch (e) { return false; }
};

userSchema.methods.incrementOtpAttempts = function () {
  this.otpAttempts = (this.otpAttempts || 0) + 1;
  return this.otpAttempts;
};

userSchema.methods.clearOtp = function () {
  this.otpHash     = null;
  this.otpExpires  = null;
  this.otpPurpose  = null;
  this.otpAttempts = 0;
};

const User = mongoose.model('User', userSchema);

// ─── Product ─────────────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  category:      { type: String, required: true },
  description:   { type: String, default: '' },
  price:         { type: Number, required: true },
  discountPrice: { type: Number, default: null },
  media: [{
    type:    { type: String, default: 'image' },
    url:     String,
    altText: { type: String, default: '' },
    order:   { type: Number, default: 0 },
  }],
  specifications: [{ key: String, value: String }],
  stock:    { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// ─── Order ───────────────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, sparse: true },
  customer: {
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name:    { type: String, default: '' },
    email:   { type: String, default: '' },
    phone:   { type: String, default: '' },
    address: {
      street:  { type: String, default: '' },
      city:    { type: String, default: '' },
      state:   { type: String, default: '' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: 'Bangladesh' },
    },
  },
  items: [{
    productId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName:  String,
    productImage: String,
    quantity:     Number,
    price:        Number,
    subtotal:     Number,
  }],
  deliveryType:    { type: String, default: 'inside_dhaka' },
  paymentType:     { type: String, default: 'full' },
  productSubtotal: { type: Number, default: 0 },
  deliveryCharge:  { type: Number, default: 0 },
  couponDiscount:  { type: Number, default: 0 },
  couponCode:      String,
  paymentAmount:   { type: Number, default: 0 },
  totalAmount:     { type: Number, default: 0 },
  status:          { type: String, default: 'pending' },
  statusHistory: [{
    status:    String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: String, default: 'system' },
    note:      String,
  }],
  paymentDetails: {
    transactionId:    { type: String, default: '' },
    transactionProof: { type: String, default: '' },
    submittedAt:      Date,
  },
  adminNotes: { type: String, default: '' },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

// ─── Coupon ──────────────────────────────────────────────────────────────────
const couponSchema = new mongoose.Schema({
  code:              { type: String, required: true, unique: true, uppercase: true, trim: true },
  description:       { type: String, default: '' },
  discountType:      { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue:     { type: Number, required: true },
  minOrderAmount:    { type: Number, default: 0 },
  maxDiscountAmount: { type: Number, default: null },
  usageLimit:        { type: Number, default: null },
  usageCount:        { type: Number, default: 0 },
  expiresAt:         Date,
  isActive:          { type: Boolean, default: true },
  userSpecific:      { type: Boolean, default: false },
  allowedUsers:      [String],
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);

// ─── Settings ────────────────────────────────────────────────────────────────
const settingsSchema = new mongoose.Schema({
  deliveryCharges: {
    insideDhaka:  { type: Number, default: 60 },
    outsideDhaka: { type: Number, default: 120 },
  },
  paymentMethods: [{
    name:         String,
    number:       String,
    instructions: String,
    isActive:     { type: Boolean, default: true },
  }],
  codEnabled:  { type: Boolean, default: true },
  categories: [{ slug: String, label: String }],
}, { timestamps: true });

const SettingsModel = mongoose.model('Settings', settingsSchema);

// Convenience wrapper to match existing controller API
const Settings = {
  async get() {
    return SettingsModel.findOne({});
  },
  async upsert(data) {
    return SettingsModel.findOneAndUpdate({}, { $set: data }, { new: true, upsert: true, setDefaultsOnInsert: true });
  },
};

// ─── Finance ─────────────────────────────────────────────────────────────────
const financeSchema = new mongoose.Schema({
  type:      { type: String, enum: ['cost', 'revenue'], required: true },
  amount:    { type: Number, required: true },
  category:  { type: String, default: 'general' },
  date:      { type: Date, default: Date.now },
  notes:     { type: String, default: '' },
  partner:   String,
  source:    String,
  reason:    String,
  orderId:   String,
  productId: String,
  userId:    String,
  createdBy: { type: String, default: 'admin' },
}, { timestamps: true });

const Finance = mongoose.model('Finance', financeSchema);

module.exports = { Admin, User, Product, Order, Coupon, Settings, Finance };

