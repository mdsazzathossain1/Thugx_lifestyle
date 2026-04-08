const Order = require('../models/Order');
const Product = require('../models/Product');
const { Settings, Coupon } = require('../db/models');

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TXL-${date}-${random}`;
}

// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { customer, items, deliveryType = 'inside_dhaka', paymentType = 'full', couponCode } = req.body;

    // Look up delivery charge from settings
    const settings = await Settings.get();
    const deliveryCharge = settings
      ? (deliveryType === 'outside_dhaka'
          ? (settings.deliveryCharges?.outsideDhaka || 120)
          : (settings.deliveryCharges?.insideDhaka || 60))
      : (deliveryType === 'outside_dhaka' ? 120 : 60);

    // Validate and build order items with current prices
    const orderItems = [];
    let productSubtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.productId}` });
      }
      if (!product.isActive) {
        return res.status(400).json({ message: `Product is unavailable: ${product.name}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for: ${product.name}` });
      }

      const price = product.discountPrice || product.price;
      const subtotal = price * item.quantity;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        productImage: product.media?.[0]?.url || '',
        quantity: item.quantity,
        price,
        subtotal,
      });

      productSubtotal += subtotal;

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Apply coupon if provided
    let couponDiscount = 0;
    let appliedCouponCode = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase() });
      if (coupon && coupon.isActive) {
        const notExpired = !coupon.expiresAt || new Date(coupon.expiresAt) >= new Date();
        const withinLimit = coupon.usageLimit === null || coupon.usageCount < coupon.usageLimit;
        const meetsMin = productSubtotal >= (coupon.minOrderAmount || 0);
        const userAllowed = !coupon.userSpecific ||
          (req.user && coupon.allowedUsers.includes(String(req.user._id)));

        if (notExpired && withinLimit && meetsMin && userAllowed) {
          if (coupon.discountType === 'percentage') {
            couponDiscount = (productSubtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && couponDiscount > coupon.maxDiscountAmount) {
              couponDiscount = coupon.maxDiscountAmount;
            }
          } else {
            couponDiscount = Math.min(coupon.discountValue, productSubtotal);
          }
          couponDiscount = Math.round(couponDiscount);
          appliedCouponCode = coupon.code;

          // Increment usage count
          coupon.usageCount = (coupon.usageCount || 0) + 1;
          await coupon.save();
        }
      }
    }

    const totalAmount = productSubtotal + deliveryCharge - couponDiscount;
    // paymentAmount = amount customer must pay NOW (full or delivery-only for COD)
    const paymentAmount = paymentType === 'delivery_only' ? deliveryCharge : totalAmount;

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      customer: {
        userId: req.user?._id || null,
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone,
        address: customer.address,
      },
      items: orderItems,
      productSubtotal,
      deliveryCharge,
      deliveryType,
      paymentType,
      couponCode: appliedCouponCode,
      couponDiscount,
      paymentAmount,
      totalAmount,
      status: 'pending',
    });

    res.status(201).json({
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      deliveryCharge: order.deliveryCharge,
      deliveryType: order.deliveryType,
      paymentType: order.paymentType,
      couponCode: order.couponCode,
      couponDiscount: order.couponDiscount,
      paymentAmount: order.paymentAmount,
      status: order.status,
      _id: order._id,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/orders/:orderNumber
const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/orders/:orderNumber/payment
const submitPayment = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Payment already submitted or order is not in pending state' });
    }

    order.paymentDetails.transactionId = req.body.transactionId;
    if (req.file) {
      order.paymentDetails.transactionProof = `/uploads/${req.file.filename}`;
    }
    order.paymentDetails.submittedAt = new Date();
    order.status = 'payment_submitted';
    order.statusHistory.push({
      status: 'payment_submitted',
      timestamp: new Date(),
      updatedBy: 'customer',
    });

    await order.save();

    res.json({ message: 'Payment details submitted', status: order.status });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/auth/orders - User orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'customer.userId': req.user._id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createOrder, getOrder, submitPayment, getUserOrders };
