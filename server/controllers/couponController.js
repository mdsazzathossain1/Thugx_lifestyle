const { Coupon, User } = require('../db/models');

// POST /api/coupons/validate  (public — called from checkout)
const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount, userId } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code is required' });

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ message: 'Invalid or expired coupon code' });
    }

    // Expiry check
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'This coupon has expired' });
    }

    // Global usage limit
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit has been reached' });
    }

    // Minimum order amount
    if (coupon.minOrderAmount > 0 && orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount of ৳${coupon.minOrderAmount} is required to use this coupon`,
      });
    }

    // User-specific check
    if (coupon.userSpecific) {
      if (!userId) {
        return res.status(400).json({ message: 'Please log in to use this coupon' });
      }
      if (!coupon.allowedUsers.includes(String(userId))) {
        return res.status(400).json({ message: 'This coupon is not available for your account' });
      }
    }

    // Calculate discount (applied on product subtotal only)
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      // fixed amount — cannot exceed order total
      discountAmount = Math.min(coupon.discountValue, orderAmount);
    }
    discountAmount = Math.round(discountAmount);

    res.json({
      valid: true,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/coupons
const getAdminCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json({ coupons });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/admin/coupons
const createCoupon = async (req, res) => {
  try {
    const {
      code, description, discountType, discountValue,
      minOrderAmount, maxDiscountAmount, usageLimit,
      userSpecific, allowedUsers, isActive, expiresAt,
    } = req.body;

    if (!code || !discountType || !discountValue) {
      return res.status(400).json({ message: 'Code, discount type and value are required' });
    }

    const upper = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: upper });
    if (existing) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: upper,
      description: description || '',
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      usageCount: 0,
      userSpecific: Boolean(userSpecific),
      allowedUsers: allowedUsers || [],
      isActive: isActive !== false,
      expiresAt: expiresAt || null,
    });

    res.status(201).json({ coupon });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/admin/coupons/:id
const updateCoupon = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.code) updates.code = updates.code.trim().toUpperCase();
    if (updates.discountValue !== undefined) updates.discountValue = Number(updates.discountValue);
    if (updates.minOrderAmount !== undefined) updates.minOrderAmount = Number(updates.minOrderAmount);
    if (updates.maxDiscountAmount !== undefined) {
      updates.maxDiscountAmount = updates.maxDiscountAmount ? Number(updates.maxDiscountAmount) : null;
    }
    if (updates.usageLimit !== undefined) {
      updates.usageLimit = updates.usageLimit ? Number(updates.usageLimit) : null;
    }
    if (updates.userSpecific !== undefined) updates.userSpecific = Boolean(updates.userSpecific);

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ coupon });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/admin/coupons/:id
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/users  (for user-specific coupon assignment)
const getUsersList = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({
      users: users.map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  validateCoupon,
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getUsersList,
};
