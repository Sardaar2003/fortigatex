const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const sendEmail = require('../utils/sendEmail');

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  console.log('Generating token for user:', user._id);
  // Create token
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  console.log('Token generated successfully');

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    console.log('Registration attempt:', req.body);
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Registration failed: User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Get default user role
    const userRole = await Role.findOne({ name: 'user' });
    if (!userRole) {
      console.log('Registration failed: Default role not found');
      return res.status(500).json({ message: 'Default role not found. Please contact administrator.' });
    }

    // Create user with auto-verification
    const user = await User.create({
      name,
      email,
      password,
      role: userRole._id,
      isVerified: true // Always auto-verify users
    });

    console.log('User registered successfully:', user._id);

    // Send token response (auto-login)
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with matching token
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    // Update user
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email });
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      console.log('Login failed: Missing credentials');
      return res.status(400).json({ message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password').populate('role');
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('Login failed: Invalid credentials for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    console.log('Password match:', isMatch ? 'Yes' : 'No');

    if (!isMatch) {
      console.log('Login failed: Invalid password for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Login successful for user:', user._id);
    // Send token
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    console.log('Get current user request for user:', req.user.id);
    const user = await User.findById(req.user.id).populate('role');

    if (!user) {
      console.log('User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Current user retrieved successfully:', user._id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with this email' });
    }

    // Get reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please click on the following link to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>This link will expire in 10 minutes.</p>
    `;

    const emailResult = await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: message
    });

    if (!emailResult.success) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ 
        success: false, 
        message: emailResult.message || 'Email could not be sent'
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Password reset email sent successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      // Check if token exists but is expired
      const expiredUser = await User.findOne({ resetPasswordToken });
      if (expiredUser) {
        return res.status(400).json({ 
          success: false,
          message: 'Password reset link has expired. Please request a new one.' 
        });
      }
      return res.status(400).json({ 
        success: false,
        message: 'Invalid password reset link. Please request a new one.' 
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};