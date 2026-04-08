const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);

    if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin auth error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

const requireSuperAdmin = (req, res, next) => {
  if (req.admin && req.admin.role === 'super_admin') {
    return next();
  }
  return res.status(403).json({ message: 'Super admin access required' });
};

module.exports = { protectAdmin, requireSuperAdmin };
