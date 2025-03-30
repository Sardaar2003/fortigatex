const Order = require('../models/Order');
const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');
const radiusService = require('../services/radiusService');
const semprisService = require('../services/semprisService');

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
      creditCardCVV,
      cardIssuer,
      voiceRecordingId,
      project,
      vendorId,
      clientOrderNumber,
      clientData,
      pitchId
    } = req.body;

    // Generate session ID if not provided
    const finalSessionId = sessionId || Math.random().toString(36).substring(2, 15);

    // Log order attempt
    logger.userAction(req.user._id, 'ORDER_ATTEMPT', {
      orderDate,
      firstName,
      lastName,
      sessionId: finalSessionId,
      state,
      project
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

    // Validate based on project type
    let validationResult;
    if (project === 'Sempris Project') {
      validationResult = await semprisService.validateCustomer({
        sessionId: finalSessionId,
        vendorId,
        sourceCode,
        sku,
        cardIssuer,
        firstName,
        lastName,
        state,
        city,
        address1,
        address2,
        zipCode,
        email,
        phoneNumber,
        creditCardNumber,
        creditCardExpiration,
        creditCardCVV,
        clientOrderNumber,
        clientData,
        pitchId
      }, req.user);
    } else {
      // Default to Radius Project
      validationResult = await radiusService.checkCustomerEligibility({
        lastName,
        address1,
        state,
        zipCode,
        creditCardNumber,
        sessionId: finalSessionId
      }, req.user);
    }

    // Store validation results
    const validationFields = {
      validationStatus: validationResult.eligible,
      validationMessage: validationResult.reason || 'Validation successful',
      validationResponse: validationResult.rawResponse,
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
      creditCardCVV,
      cardIssuer,
      voiceRecordingId,
      project,
      vendorId,
      clientOrderNumber,
      clientData,
      pitchId,
      user: req.user._id,
      ...validationFields,
      // If validation failed, set status to cancelled
      status: validationResult.eligible ? 'pending' : 'cancelled'
    });

    // Log order creation
    logger.userAction(req.user._id, 'ORDER_CREATED', {
      orderId: order._id,
      sessionId: finalSessionId,
      validationStatus: validationResult.eligible,
      validationMessage: validationResult.reason,
      project
    });

    // Return response based on validation result
    if (validationResult.eligible) {
      res.status(201).json({
        success: true,
        data: order
      });
    } else {
      res.status(400).json({
        success: false,
        message: validationResult.reason || 'Customer validation failed',
        validation: {
          eligible: validationResult.eligible,
          reason: validationResult.reason
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

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build query
  const query = {};

  // Add filters if provided
  if (req.query.firstName) {
    query.firstName = { $regex: req.query.firstName, $options: 'i' };
  }
  if (req.query.lastName) {
    query.lastName = { $regex: req.query.lastName, $options: 'i' };
  }
  if (req.query.email) {
    query.email = { $regex: req.query.email, $options: 'i' };
  }
  if (req.query.status) {
    query.status = req.query.status;
  }
  if (req.query.validationStatus !== undefined) {
    query.validationStatus = req.query.validationStatus === 'true';
  }
  if (req.query.project) {
    query.project = req.query.project;
  }

  // Get total count for pagination
  const total = await Order.countDocuments(query);

  // Get orders with pagination
  const orders = await Order.find(query)
    .sort({ orderDate: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: orders,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  });
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