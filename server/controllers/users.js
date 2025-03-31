const User = require('../models/User');
const Role = require('../models/Role');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    console.log('Fetching all users - Request from:', req.user.email);
    console.log('User role:', req.user.role.name);
    
    const users = await User.find().populate('role');
    console.log(`Found ${users.length} users`);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  try {
    console.log('Fetching user by ID:', req.params.id);
    console.log('Request from:', req.user.email);
    
    const user = await User.findById(req.params.id).populate('role');

    if (!user) {
      console.log('User not found:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user.email);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate role
    const roleExists = await Role.findById(role);
    if (!roleExists) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      isVerified: true // Admin created users are verified by default
    });

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    // Find user
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email already exists (if changing email)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Validate role if provided
    if (role) {
      const roleExists = await Role.findById(role);
      if (!roleExists) {
        return res.status(400).json({ message: 'Invalid role' });
      }
    }

    // Update user
    user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true, runValidators: true }
    ).populate('role');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is trying to delete themselves
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    // Find user
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate role
    const roleExists = await Role.findById(role);
    if (!roleExists) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Update user role
    user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).populate('role');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}; 