const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    console.log('Protect middleware: Checking authorization header');
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found in authorization header');
    }

    if (!token) {
      console.log('Protect middleware: No token found');
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
      console.log('Protect middleware: Verifying token');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified successfully for user:', decoded.id);

      req.user = await User.findById(decoded.id).populate('role');
      if (!req.user) {
        console.log('Protect middleware: User not found for token');
        return res.status(401).json({ message: 'User not found' });
      }
      console.log('User found and attached to request:', req.user._id);
      next();
    } catch (err) {
      console.error('Protect middleware: Token verification failed:', err.message);
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }
  } catch (error) {
    console.error('Protect middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    try {
      console.log('Authorize middleware: Checking roles for user:', req.user._id);
      console.log('Required roles:', roles);
      console.log('User role:', req.user.role?.name);

      if (!req.user || !req.user.role) {
        console.log('Authorize middleware: User or role not found');
        return res.status(403).json({ message: 'Forbidden: Access denied' });
      }

      if (!roles.includes(req.user.role.name)) {
        console.log('Authorize middleware: User not authorized for roles:', roles);
        return res.status(403).json({
          message: `User role ${req.user.role.name} is not authorized to access this route`
        });
      }

      console.log('User authorized successfully');
      next();
    } catch (error) {
      console.error('Authorize middleware error:', error);
      res.status(500).json({ message: 'Server error' });
    }
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