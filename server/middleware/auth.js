const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in the request header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user in database
    req.user = await User.findById(decoded.id).populate('role');

    if (!req.user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }

    if (!roles.includes(req.user.role.name)) {
      return res.status(403).json({ message: `Role ${req.user.role.name} is not authorized to access this route` });
    }

    next();
  };
};

// Check for specific permissions
exports.hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role || !req.user.role.permissions) {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }

    if (!req.user.role.permissions.includes(permission)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }

    next();
  };
}; 