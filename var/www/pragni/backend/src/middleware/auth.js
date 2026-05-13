const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Verify admin/trainer JWT
const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authorized' });
  }
  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) return res.status(401).json({ error: 'Not authorized' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin only
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Trainer or Admin (or semi-admin with any permission)
const trainerOrAdmin = (req, res, next) => {
  if (!['admin', 'trainer', 'semi-admin'].includes(req.user?.role)) {
    return res.status(403).json({ error: 'Access required' });
  }
  next();
};

// Permission check for semi-admin
// Usage: hasPermission('seo') — allows admin always, semi-admin if has that permission
const hasPermission = (perm) => (req, res, next) => {
  const role = req.user?.role;
  if (role === 'admin') return next();
  if (role === 'semi-admin' && (req.user.permissions || []).includes(perm)) return next();
  return res.status(403).json({ error: 'Permission denied' });
};

module.exports = { protect, adminOnly, trainerOrAdmin, hasPermission };
