const express = require('express');
const router = express.Router();
const { Admin } = require('../db/models');  // Import Admin model for diagnostics
const {
  adminLogin,
  getDashboard,
  getOrders,
  getOrderById,
  confirmPayment,
  updateOrderStatus,
  uploadMedia,
} = require('../controllers/adminController');
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const {
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getUsersList,
} = require('../controllers/couponController');
const { protectAdmin } = require('../middleware/adminAuth');
const { uploadProduct } = require('../middleware/upload');

// Finance controller
const {
  createFinanceItem,
  updateFinanceItem,
  deleteFinanceItem,
  listFinanceItems,
  financeSummary,
  summaryByPartner,
  summaryByProduct,
  timeSeries,
} = require('../controllers/financeController');

// Public - Debug password comparison (TEST ENDPOINT - REMOVE IN PRODUCTION)
router.post('/debug-password', async (req, res) => {
  try {
    const { password } = req.body;
    const bcrypt = require('bcryptjs');
    
    const admin = await Admin.findOne({ email: 'admin@thugxlifestyle.com' });
    
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    
    console.log('\n🔍 PASSWORD DEBUG INFO:');
    console.log('Input password:', password);
    console.log('Input password length:', password.length);
    console.log('Input password type:', typeof password);
    console.log('Input password charCodes:', [...password].map(c => c.charCodeAt(0)));
    
    console.log('\nStored hash:', admin.password);
    console.log('Stored hash length:', admin.password.length);
    console.log('Stored hash type:', typeof admin.password);
    
    console.log('\nTesting bcrypt.compare()...');
    const result = await bcrypt.compare(password, admin.password);
    console.log('Comparison result:', result);
    
    console.log('\nTesting bcrypt.compare() with different inputs...');
    const test1 = await bcrypt.compare('Admin@123', admin.password);
    console.log('Test with hardcoded "Admin@123":', test1);
    
    const test2 = await bcrypt.compare(password.trim(), admin.password);
    console.log('Test with trimmed password:', test2);
    
    res.json({
      password: `[length: ${password.length}, chars: ${password}]`,
      hash: `${admin.password.substring(0, 20)}...`,
      comparison: result,
      test_hardcoded: test1,
      test_trimmed: test2
    });
  } catch (err) {
    console.error('Debug error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Public - Force reseed admin (for fixing corrupted passwords)
router.get('/reseed-admin', async (req, res) => {
  try {
    console.log('🔄 Force reseeding admin...');
    
    const fs = require('fs');
    const path = require('path');
    const adminFilePath = path.join(__dirname, '../db/data/admins.json');
    
    // Backup old file
    if (fs.existsSync(adminFilePath)) {
      fs.copyFileSync(adminFilePath, adminFilePath + '.backup');
      console.log('📦 Backed up old admin file');
    }
    
    // Delete the admin data file to force fresh creation
    if (fs.existsSync(adminFilePath)) {
      fs.unlinkSync(adminFilePath);
      console.log('🗑️  Deleted old admin records file');
    }
    
    // Create fresh admin with new hash
    const freshAdmin = await Admin.create({
      username: 'admin',
      email: 'admin@thugxlifestyle.com',
      password: 'Admin@123',
      role: 'super_admin',
    });
    
    console.log('✅ Fresh admin reseeded successfully');
    res.json({ 
      success: true, 
      message: 'Admin reseeded successfully! Please login now.',
      email: 'admin@thugxlifestyle.com',
      password: 'Admin@123'
    });
  } catch (err) {
    console.error('❌ Reseed failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Public - Diagnostic endpoint (no auth required)
router.get('/check-admin', async (req, res) => {
  try {
    const admin = await Admin.findOne({ email: 'admin@thugxlifestyle.com' });
    if (admin) {
      res.json({ 
        exists: true, 
        email: admin.email,
        username: admin.username,
        role: admin.role,
        hasPassword: !!admin.password,
        passwordHashPreview: admin.password ? admin.password.substring(0, 30) + '...' : 'MISSING'
      });
    } else {
      res.status(404).json({ exists: false, message: 'Admin not found in database' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public
router.post('/login', adminLogin);

// Protected
router.use(protectAdmin);

router.get('/dashboard', getDashboard);

// Products
router.get('/products', getAllProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Upload
router.post('/upload', uploadProduct.array('media', 8), uploadMedia);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Orders
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/confirm', confirmPayment);
router.put('/orders/:id/status', updateOrderStatus);

// Coupons
router.get('/coupons', getAdminCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Finance (costs & revenues)
router.get('/finances', listFinanceItems);
router.post('/finances', createFinanceItem);
router.put('/finances/:id', updateFinanceItem);
router.delete('/finances/:id', deleteFinanceItem);
router.get('/finances/summary', financeSummary);
router.get('/finances/summary/partners', summaryByPartner);
router.get('/finances/summary/products', summaryByProduct);
router.get('/finances/summary/timeseries', timeSeries);

// Users list (for coupon assignment)
router.get('/users', getUsersList);

module.exports = router;
