const Admin = require('../models/Admin');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { uploadToCloudinary, useCloudinary } = require('../middleware/upload');
const { Finance } = require('../db/models');

// Helper: auto-record order revenue in Finance (idempotent — skips if already recorded)
async function recordOrderRevenue(order, createdBy) {
  try {
    const existing = await Finance.findOne({ orderId: String(order._id), type: 'revenue', category: 'order_sale' });
    if (existing) return;
    const itemSummary = (order.items || []).map(i => `${i.productName} x${i.quantity}`).join(', ');
    await Finance.create({
      type:      'revenue',
      amount:    order.totalAmount,
      category:  'order_sale',
      date:      new Date(),
      reason:    `Order ${order.orderNumber}`,
      notes:     itemSummary,
      orderId:   String(order._id),
      userId:    order.customer?.userId ? String(order.customer.userId) : null,
      createdBy: createdBy || 'system',
      source:    'order',
      partner:   null,
    });
  } catch (e) {
    console.error('recordOrderRevenue error:', e.message);
  }
}

// POST /api/admin/login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Admin login attempt:', email);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email });
    console.log('👤 Admin found:', admin ? `Yes - ${admin.email}` : 'No');
    console.log('🔍 Admin object keys:', admin ? Object.keys(admin) : 'N/A');
    console.log('🔑 Password field exists:', admin && 'password' in admin ? 'Yes' : 'No');
    console.log('🔑 Password field type:', admin && admin.password ? typeof admin.password : 'N/A');
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('🔑 Attempting password comparison...');
    const isMatch = await admin.comparePassword(password);
    console.log('✔️ Password match result:', isMatch ? 'TRUE ✅' : 'FALSE ❌');
    
    if (!isMatch) {
      // Extra diagnostic info when password fails
      console.log('⚠️  Password mismatch for admin:', email);
      console.log('📊 Admin stored password hash:', admin.password ? admin.password.substring(0, 20) + '...' : 'MISSING');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('✨ Generating token for admin:', admin.email);
    res.json({
      _id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id, admin.role),
    });
  } catch (error) {
    console.error('❌ Admin login error:', error.message);
    console.error('📍 Stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      pendingPayments,
      totalProducts,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      Order.countDocuments({ createdAt: { $gte: weekStart } }),
      Order.countDocuments({ createdAt: { $gte: monthStart } }),
      Order.countDocuments({ status: 'payment_submitted' }),
      Product.countDocuments(),
      Product.countDocuments({ stock: { $lte: 5 }, isActive: true }),
      Order.find().sort({ createdAt: -1 }).limit(10),
    ]);

    // Revenue from confirmed+ orders
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    // Finance summary (costs and manual revenues)
    let totalCosts = 0;
    try {
      const Finance = require('../db/models').Finance;
      const finAgg = await Finance.aggregate([
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]);
      for (const r of finAgg) {
        if (r._id === 'cost') totalCosts = r.total || 0;
        if (r._id === 'revenue') totalRevenue += r.total || 0;
      }
    } catch (e) {
      // ignore if finance collection not available
    }

    const netProfit = (totalRevenue || 0) - (totalCosts || 0);

    res.json({
      totalOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      pendingPayments,
      totalProducts,
      lowStockProducts,
      totalRevenue,
      totalCosts,
      netProfit,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/orders
const getOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ orders, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), total });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/admin/orders/:id/confirm
const confirmPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'payment_submitted') {
      return res.status(400).json({ message: 'Order payment has not been submitted' });
    }

    order.status = 'confirmed';
    order.statusHistory.push({
      status: 'confirmed',
      timestamp: new Date(),
      updatedBy: req.admin.username,
    });

    if (req.body.adminNotes) {
      order.adminNotes = req.body.adminNotes;
    }

    await order.save();
    await recordOrderRevenue(order, req.admin.username);

    res.json({ message: 'Payment confirmed', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'payment_submitted', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const prevStatus = order.status;
    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: req.admin.username,
    });

    if (req.body.adminNotes) {
      order.adminNotes = req.body.adminNotes;
    }

    // Restore stock if cancelled
    if (status === 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }
    }

    await order.save();

    // Auto-record revenue when order is confirmed (handles COD and direct confirms)
    if (status === 'confirmed' && prevStatus !== 'confirmed') {
      await recordOrderRevenue(order, req.admin.username);
    }

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload media
const uploadMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    let media;

    if (useCloudinary) {
      // Upload each file buffer to Cloudinary
      media = await Promise.all(
        req.files.map(async (file, index) => {
          const url = await uploadToCloudinary(file.buffer, file.mimetype, file.originalname);
          return {
            type: file.mimetype.startsWith('video/') ? 'video' : 'image',
            url,
            altText: '',
            order: index,
          };
        })
      );
    } else {
      // Local disk (development) — build absolute URL using BACKEND_URL
      const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
      media = req.files.map((file, index) => ({
        type: file.mimetype.startsWith('video/') ? 'video' : 'image',
        url: `${backendUrl}/uploads/${file.filename}`,
        altText: '',
        order: index,
      }));
    }

    res.json({ media });
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

module.exports = {
  adminLogin,
  getDashboard,
  getOrders,
  getOrderById,
  confirmPayment,
  updateOrderStatus,
  uploadMedia,
};
