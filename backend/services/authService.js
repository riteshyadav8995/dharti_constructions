const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const determineRole = (email) => {
  if (email.trim().toLowerCase().endsWith('@dharti.co.in')) {
    return 'admin';
  }
  return 'site_manager';
};

module.exports = {
  generateToken,
  determineRole,
};
