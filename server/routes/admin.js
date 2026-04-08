const express = require('express');
const router = express.Router();
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
