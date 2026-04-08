const jwt = require('jsonwebtoken');

const generateToken = (id, role = 'user') => {
  const secret = role === 'admin' || role === 'super_admin'
    ? process.env.JWT_ADMIN_SECRET
    : process.env.JWT_SECRET;

  return jwt.sign({ id, role }, secret, {
    expiresIn: role === 'admin' || role === 'super_admin' ? '8h' : '7d',
  });
};

module.exports = generateToken;
