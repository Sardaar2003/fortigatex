const Order = require('../models/Order');
const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');
const radiusService = require('../services/radiusService');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  try {
    const {
      orderDate,
      firstName,
      lastName,
      address1,
      address2,
      city,
      state,
      zipCode,
      phoneNumber,
      email,
      sourceCode,
      sku,
      productName,
      sessionId,
      creditCardNumber,
      creditCardExpiration,
      voiceRecordingId
    } = req.body;

    // Generate session ID if not provided
    const finalSessionId = sessionId || Math.random().toString(36).substring(2, 15);

    // Log order attempt
    logger.userAction(req.user._id, 'ORDER_ATTEMPT', {
      orderDate,
      firstName,
      lastName,
      sessionId: finalSessionId,
      state
    });

    // Check restricted states (additional validation)
    const restrictedStates = ['IA', 'ME', 'MN', 'UT', 'VT', 'WI'];
    if (restrictedStates.includes(state)) {
      logger.userAction(req.user._id, 'ORDER_REJECTED', {
        reason: `Orders from ${state} cannot be accepted`,
        sessionId: finalSessionId
      });
      
      return res.status(400).json({ 
        success: false, 
        message: `Orders from ${state} cannot be accepted` 
      });
    }

    // Store only last 4 digits of credit card for security
    const creditCardLast4 = creditCardNumber.slice(-4);

    // Call Radius API to validate customer eligibility
    const radiusValidation = await radiusService.checkCustomerEligibility({
      lastName,
      address1,
      state,
      zipCode,
      creditCardNumber,
      sessionId: finalSessionId
    }, req.user);

    // Store validation results
    const validationFields = {
      validationStatus: radiusValidation.eligible,
      validationMessage: radiusValidation.reason || 'Validation successful',
      validationResponse: radiusValidation.rawResponse,
      validationDate: new Date()
    };

    // Create order in database with validation results
    const order = await Order.create({
      orderDate,
      firstName,
      lastName,
      address1,
      address2,
      city,
      state,
      zipCode,
      phoneNumber,
      email,
      sourceCode,
      sku,
      productName,
      sessionId: finalSessionId,
      creditCardLast4,
      creditCardExpiration,
      voiceRecordingId,
      user: req.user._id,
      ...validationFields,
      // If validation failed, set status to cancelled
      status: radiusValidation.eligible ? 'pending' : 'cancelled'
    });

    // Log order creation
    logger.userAction(req.user._id, 'ORDER_CREATED', {
      orderId: order._id,
      sessionId: finalSessionId,
      validationStatus: radiusValidation.eligible,
      validationMessage: radiusValidation.reason
    });

    // Return response based on validation result
    if (radiusValidation.eligible) {
      res.status(201).json({
        success: true,
        data: order
      });
    } else {
      res.status(400).json({
        success: false,
        message: radiusValidation.reason || 'Customer validation failed',
        validation: {
          eligible: radiusValidation.eligible,
          reason: radiusValidation.reason
        },
        data: order
      });
    }
  } catch (error) {
    logger.error(`Order creation error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error while processing order',
      error: error.message
    });
  }
});

// @desc    Get all orders with optional filters
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  // Get filter options from query params
  const { 
    firstName, lastName, email, phoneNumber, status,
    startDate, endDate, page = 1, limit = 10 
  } = req.query;
  
  // Build filter object
  const filter = {};
  
  // Only add filters if they are provided
  if (firstName) filter.firstName = { $regex: firstName, $options: 'i' };
  if (lastName) filter.lastName = { $regex: lastName, $options: 'i' };
  if (email) filter.email = { $regex: email, $options: 'i' };
  if (phoneNumber) filter.phoneNumber = { $regex: phoneNumber, $options: 'i' };
  if (status) filter.status = status;
  
  // Handle date range filter
  if (startDate || endDate) {
    filter.orderDate = {};
    if (startDate) filter.orderDate.$gte = new Date(startDate);
    if (endDate) filter.orderDate.$lte = new Date(endDate + 'T23:59:59.999Z');
  }
  
  // Convert page and limit to numbers
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  try {
    // Get total count
    const totalOrders = await Order.countDocuments(filter);
    
    // Calculate pagination
    const totalPages = Math.ceil(totalOrders / limitNum);
    const skip = (pageNum - 1) * limitNum;
    
    // Get orders with filters and pagination
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    // Return results
    res.json({
      success: true,
      count: orders.length,
      totalPages,
      currentPage: pageNum,
      data: orders
    });
  } catch (err) {
    console.error('Error retrieving orders:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error: Unable to retrieve orders'
    });
  }
});

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  
  // Check if user is admin or owner of the order
  if (req.user.role.name !== 'admin' && order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized to access this order' });
  }
  
  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
const updateOrder = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  // Find the order
  let order = await Order.findById(req.params.id);
  
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  
  // Update the order
  order.status = status || order.status;
  order = await order.save();
  
  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  
  // Use deleteOne() instead of remove() which is deprecated
  await Order.deleteOne({ _id: order._id });
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getMyOrders
}; 