const express = require('express');
const router = express.Router();
const { createOrder, getOrder, submitPayment } = require('../controllers/orderController');
const { optionalAuth } = require('../middleware/auth');
const { uploadProof } = require('../middleware/upload');
const { validate, orderSchema, paymentSchema } = require('../middleware/validation');

router.post('/', optionalAuth, validate(orderSchema), createOrder);
router.get('/:orderNumber', getOrder);
router.put('/:orderNumber/payment', uploadProof.single('transactionProof'), submitPayment);

module.exports = router;
