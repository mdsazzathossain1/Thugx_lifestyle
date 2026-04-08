const express = require('express');
const router = express.Router();
const { getProducts, getFeaturedProducts, getProduct } = require('../controllers/productController');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProduct);

module.exports = router;
