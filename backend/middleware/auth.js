const jwt = require('jsonwebtoken');
const { UserModel } = require('../models/store');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = UserModel.findById(payload.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = UserModel.toPublic(user);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Optional auth — attaches user if token present but doesn't block
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const token = header.slice(7);
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = UserModel.findById(payload.userId);
      if (user) req.user = UserModel.toPublic(user);
    } catch {}
  }
  next();
}

module.exports = { authenticate, optionalAuth };
