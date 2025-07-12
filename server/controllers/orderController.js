const Order = require('../models/Order');
const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');
const radiusService = require('../services/radiusService');
const semprisService = require('../services/semprisService');
const psonlineService = require('../services/psonlineService');

// @desc    Process Radius order
// @route   POST /api/orders/radius
// @access  Private
const processRadiusOrder = asyncHandler(async (req, res) => {
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
    creditCardNumber,
    creditCardExpiration,
    sessionId
  } = req.body;

  // Validate required fields
  const requiredFields = {
    orderDate,
    firstName,
    lastName,
    address1,
    city,
    state,
    zipCode,
    phoneNumber,
    email,
    sourceCode,
    sku,
    productName,
    creditCardNumber,
    creditCardExpiration
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`
    });
  }

  // Check for restricted states
  const restrictedStates = ['IA', 'ME', 'MN', 'UT', 'VT', 'WI'];
  if (restrictedStates.includes(state.toUpperCase())) {
    return res.status(400).json({
      success: false,
      message: `Orders from ${state} cannot be accepted`
    });
  }

  try {
    // Extract last 4 digits of credit card
    const creditCardLast4 = creditCardNumber.slice(-4);
    const bin = creditCardNumber.slice(0, 10);

    // Build XML request
    const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
      <request>
        <auth>
          <api_key>${process.env.RADIUS_API_KEY}</api_key>
        </auth>
        <customer>
          <first_name>${firstName}</first_name>
          <last_name>${lastName}</last_name>
          <address1>${address1}</address1>
          ${address2 ? `<address2>${address2}</address2>` : ''}
          <city>${city}</city>
          <state>${state}</state>
          <zip>${zipCode}</zip>
          <phone>${phoneNumber}</phone>
          <email>${email}</email>
        </customer>
        <bin>${bin}</bin>
        <session_id>${sessionId || Math.random().toString(36).substring(2, 15)}</session_id>
      </request>`;

    console.log('Sending request to Radius API:', xmlRequest);

    // Call Radius API
    const response = await radiusService.checkCustomerEligibility(xmlRequest, req.user);
    console.log('Radius API response:', response);

    // Store the specific response message
    let statusMessage = '';
    let orderStatus = 'pending';
    let validationStatus = false;

    // Handle all possible responses exactly as defined
    if (response.status === 0) {
      if (response.message.includes('field is required')) {
        statusMessage = `Missing Field: ${response.message}`;
      } else if (response.message === 'You are not authorized to access this resource!') {
        statusMessage = 'Bad/Invalid API Key: You are not authorized to access this resource!';
      } else {
        statusMessage = response.message || 'Error processing request';
      }
      orderStatus = 'cancelled';
      validationStatus = false;
    } else if (response.status === 1) {
      if (response.message === 'Blocked BIN') {
        statusMessage = 'Blocked BIN Provided: Customer credit card BIN is blocked';
        orderStatus = 'cancelled';
        validationStatus = false;
      } else if (response.message === 'Blocked Customer') {
        statusMessage = 'Blocked Customer Provided: Customer is blocked';
        orderStatus = 'cancelled';
        validationStatus = false;
      } else if (response.message === 'Blocked State') {
        statusMessage = 'Blocked State Provided: Customer state is blocked';
        orderStatus = 'cancelled';
        validationStatus = false;
      } else if (response.message === 'true') {
        statusMessage = 'Allow Promotion: Customer, state and BIN passed all checks';
        orderStatus = 'completed';
        validationStatus = true;
      }
    }

    // Create order in database
    const order = await Order.create({
      user: req.user._id,
      project: 'Radius Project',
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
      creditCardNumber,
      creditCardLast4,
      creditCardExpiration,
      status: orderStatus,
      responseMessage: statusMessage,
      sessionId: sessionId || Math.random().toString(36).substring(2, 15),
      validationStatus: validationStatus,
      validationMessage: statusMessage,
      validationResponse: {
        status: response.status,
        message: response.message
      },
      validationDate: new Date()
    });

    // Return appropriate response based on order status
    if (orderStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: statusMessage,
        data: order
      });
    }

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error processing Radius order:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing order'
    });
  }
});

// @desc    Process Sempris order
// @route   POST /api/orders/sempris
// @access  Private
const processSemprisOrder = asyncHandler(async (req, res) => {
  console.log('\n=== Starting Sempris Order Processing ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('User ID:', req.user.id);

  try {
    // Validate customer with Sempris service
    console.log('\n=== Sempris Service Validation ===');
    const validationResult = await semprisService.validateCustomer(req.body, req.user);
    console.log('Sempris API Response:', validationResult);

    // Determine order status based on Sempris response
    let orderStatus = 'pending';
    let validationStatus = false;
    let statusMessage = '';

    if (validationResult.eligible) {
      orderStatus = 'completed';
      validationStatus = true;
      statusMessage = 'Order accepted by Sempris';
    } else {
      orderStatus = 'cancelled';
      validationStatus = false;
      statusMessage = validationResult.reason || 'Order rejected by Sempris';
    }

    // Create order in database
    console.log('\n=== Database Operation ===');
    console.log('Creating Sempris order in database...');

    const order = await Order.create({
      orderDate: new Date().toISOString(),
      firstName: req.body.first_name,
      lastName: req.body.last_name,
      address1: req.body.address1,
      address2: req.body.address2,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zip,
      phoneNumber: req.body.phone,
      email: req.body.email,
      sourceCode: req.body.source,
      sku: req.body.sku,
      productName: 'Sempris Product',
      creditCardNumber: req.body.card_number,
      creditCardLast4: req.body.card_number.slice(-4),
      creditCardExpiration: req.body.card_expiration,
      creditCardCVV: req.body.card_cvv,
      cardIssuer: req.body.issuer,
      project: 'Sempris Project',
      sessionId: req.body.tracking_number,
      vendorId: req.body.vendor_id,
      clientOrderNumber: req.body.client_order_number,
      clientData: req.body.client_data,
      pitchId: req.body.pitch_id,
      user: req.user.id,
      status: orderStatus,
      validationStatus: validationStatus,
      validationMessage: statusMessage,
      validationResponse: validationResult.rawResponse,
      validationDate: new Date()
    });

    console.log('✅ Order created successfully');
    console.log('Order ID:', order._id);
    console.log('Order Status:', orderStatus);
    console.log('Validation Status:', validationStatus);
    console.log('Validation Message:', statusMessage);
    console.log('=== End Sempris Order Processing ===\n');

    // Return appropriate response based on order status
    if (orderStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: statusMessage,
        data: order
      });
    }

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error('\n❌ Error in Sempris Order Processing');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Error details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });
    console.log('=== End Sempris Order Processing with Error ===\n');
    
    res.status(500).json({
      success: false,
      message: 'Error processing Sempris order',
      error: err.message
    });
  }
});

// @desc    Process PSOnline order
// @route   POST /api/orders/psonline
// @access  Private
const processPSOnlineOrder = asyncHandler(async (req, res) => {
  console.log('\n=== PSOnline Order Controller: Started ===');
  console.log('Request body:', {
    ...req.body,
    card_num: req.body.card_num ? `${req.body.card_num.substring(0, 4)}****${req.body.card_num.substring(-4)}` : 'Missing',
    card_cvv: req.body.card_cvv ? '***' : 'Missing'
  });
  console.log('User ID:', req.user._id);
  
  try {
    console.log('Validating order data...');
    // Validate order data
    psonlineService.validateOrderData(req.body);

    console.log('Order data validated successfully');
    console.log('Processing order with PSOnline...');
    // Process order with PSOnline
    const response = await psonlineService.processOrder(req.body);
    console.log('PSOnline response received:', response);

    // Determine order status based on PSOnline response
    let orderStatus = 'pending';
    let validationStatus = false;
    let statusMessage = '';

    console.log('Determining order status...');
    console.log('Response code:', response.ResponseCode);
    console.log('Response data:', response.ResponseData);
    
    if (response.ResponseCode === 200) {
      orderStatus = 'completed';
      validationStatus = true;
      statusMessage = 'Order processed successfully';
      console.log('Order status: COMPLETED');
    } else {
      orderStatus = 'cancelled';
      validationStatus = false;
      statusMessage = response.ResponseData || 'Order processing failed';
      console.log('Order status: CANCELLED -', statusMessage);
    }

    console.log('Creating order in database...');
    // Create order in database
    const order = await Order.create({
      user: req.user._id,
      project: 'PSOnline Project',
      orderDate: new Date(),
      firstName: req.body.CustomerFirstName,
      lastName: req.body.CustomerLastName,
      address1: req.body.BillingStreetAddress,
      address2: req.body.BillingApt,
      city: req.body.BillingCity,
      state: req.body.BillingState,
      zipCode: req.body.BillingZipCode,
      phoneNumber: req.body.BillingHomePhone,
      email: req.body.Email,
      creditCardNumber: req.body.card_num,
      creditCardLast4: req.body.card_num.slice(-4),
      creditCardExpiration: `${req.body.card_expm}/${req.body.card_expy}`,
      creditCardCVV: req.body.card_cvv,
      amount: req.body.amount,
      productId: req.body.productid_1,
      productSku: req.body.productsku_1 || `PSO-${req.body.productid_1}`,
      productName: req.body.productid_1 === '43' ? 'ID Theft' : req.body.productid_1 === '46' ? 'Telemed' : 'PSOnline Product',
      quantity: req.body.productqty_1,
      status: orderStatus,
      validationStatus: validationStatus,
      validationMessage: statusMessage,
      validationResponse: response,
      validationDate: new Date()
    });

    console.log('Order created in database:', order._id);
    
    // Return appropriate response based on order status
    if (orderStatus === 'cancelled') {
      console.log('Returning cancelled order response');
      return res.status(400).json({
        success: false,
        message: statusMessage,
        data: order
      });
    }

    console.log('Returning successful order response');
    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('=== PSOnline Order Controller: Error ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error type:', error.constructor.name);
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing order'
    });
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email');
  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
const updateOrder = asyncHandler(async (req, res) => {
  let order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  order = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  await order.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

module.exports = {
  processRadiusOrder,
  processSemprisOrder,
  processPSOnlineOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getMyOrders
}; 