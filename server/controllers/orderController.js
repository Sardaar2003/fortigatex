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

  // ✅ Validate required fields
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

  // ✅ Block restricted US states
  const restrictedStates = ['IA', 'ME', 'MN', 'UT', 'VT', 'WI'];
  if (restrictedStates.includes(state.toUpperCase())) {
    return res.status(400).json({
      success: false,
      message: `Orders from ${state} cannot be accepted`
    });
  }

  try {
    const creditCardLast4 = creditCardNumber.slice(-4);
    
    // ✅ Extract BIN (first 6–10 digits preferred) and pad to 10 digits with zeros
    const rawBin = creditCardNumber.slice(0, 10);
    const bin = rawBin.padEnd(10, '0'); // <-- Pads to 10 digits if fewer

    const generatedSessionId = sessionId || Math.random().toString(36).substring(2, 15);
    const dnis = '00000'; // <-- Use static value unless you use real DNIS from telephony
    const fullAddress = `${address1}${address2 ? ', ' + address2 : ''}`;
    const fullName = `${firstName} ${lastName}`;
    const apiKey = process.env.RADIUS_API_KEY;

    // ✅ Build Radius XML request in required format
    const buildRadiusXmlRequest = ({ sessionId, dnis, apiKey, name, address, state, zip, bin }) => {
      return `<?xml version="1.0" encoding="UTF-8"?>
<disposition session_id="${sessionId}" dnis="${dnis}">
  <field id="key" value="${apiKey}" />
  <field id="name" value="${name}" />
  <field id="address" value="${address}" />
  <field id="state" value="${state}" />
  <field id="zip" value="${zip}" />
  <field id="bin" value="${bin}" />
</disposition>`;
    };

    const xmlRequest = buildRadiusXmlRequest({
      sessionId: generatedSessionId,
      dnis,
      apiKey,
      name: fullName,
      address: fullAddress,
      state,
      zip: zipCode,
      bin
    });

    console.log('Sending Radius XML Request:', xmlRequest);

    // ✅ Send request to Radius API
    const response = await radiusService.checkCustomerEligibility(xmlRequest, req.user);
    console.log('Radius API Response:', response);

    // ✅ Handle all possible responses
    let statusMessage = '';
    let orderStatus = 'pending';
    let validationStatus = false;

    if (response.status === 0) {
      // ✅ Handle failed responses
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
      // ✅ Handle blocked or passed responses
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
      } else {
        // Unknown 1-status response
        statusMessage = response.message || 'Unexpected response';
        orderStatus = 'cancelled';
        validationStatus = false;
      }
    }

    // ✅ Create order record
    const order = await Order.create({
      user: req.user._id,
      project: 'FRP Project',
      orderDate,
      firstName,
      lastName,
      address1,
      address2,
      city,
      state,
      zipCode,
      phoneNumber,
      secondaryPhoneNumber: req.body.secondaryPhoneNumber,
      email,
      sourceCode,
      sku,
      productName,
      creditCardNumber,
      creditCardLast4,
      creditCardExpiration,
      status: orderStatus,
      responseMessage: statusMessage,
      sessionId: generatedSessionId,
      validationStatus,
      validationMessage: statusMessage,
      validationResponse: {
        status: response.status,
        message: response.message
      },
      validationDate: new Date()
    });

    // ✅ Respond to client
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
      secondaryPhoneNumber: req.body.secondary_phone,
      email: req.body.email,
      sourceCode: req.body.source,
      sku: req.body.sku,
      productName: 'SC Product',
      creditCardNumber: req.body.card_number,
      creditCardLast4: req.body.card_number.slice(-4),
      creditCardExpiration: req.body.card_expiration,
      creditCardCVV: req.body.card_cvv,
      cardIssuer: req.body.issuer,
      project: 'SC Project',
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
      validationDate: new Date(),
      transactionId: validationResult.transactionId,
      transactionDate: new Date()
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
    const result = await psonlineService.processOrder(req.body);
    
    console.log('\n=== PSOnline API Result ===');
    console.log('Result type:', typeof result);
    console.log('Result:', result);
    console.log('Result as string:', JSON.stringify(result, null, 2));
    console.log('================================\n');

    // Determine order status based on PSOnline response
    let orderStatus = 'pending';
    let validationStatus = false;
    let statusMessage = '';

    if (result.success && result.data) {
      const psonlineResponse = result.data;
      
      if (psonlineResponse.ResponseCode === 200) {
        orderStatus = 'completed';
        validationStatus = true;
        statusMessage = 'Order processed successfully by PSOnline';
      } else {
        orderStatus = 'cancelled';
        validationStatus = false;
        statusMessage = psonlineResponse.ResponseData || 'Order rejected by PSOnline';
      }
    } else {
      orderStatus = 'cancelled';
      validationStatus = false;
      statusMessage = result.error || 'Failed to process order with PSOnline';
    }

    // Create order in database
    console.log('\n=== Database Operation ===');
    console.log('Creating PSOnline order in database...');

    // Format date to MM/DD/YYYY
    const formatDate = (date) => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };

    // Format expiration to MMYY
    const formatExpiration = (month, year) => {
      return `${month}${String(year).slice(-2)}`;
    };

    const order = await Order.create({
      orderDate: formatDate(new Date()),
      firstName: req.body.CustomerFirstName,
      lastName: req.body.CustomerLastName,
      address1: req.body.BillingStreetAddress,
      address2: req.body.BillingApt,
      city: req.body.BillingCity,
      state: req.body.BillingState,
      zipCode: req.body.BillingZipCode,
      phoneNumber: req.body.BillingHomePhone,
      secondaryPhoneNumber: req.body.secondaryPhone,
      email: req.body.Email,
      sourceCode: 'PSO', // Max 6 characters
      sku: 'PSO-SKU', // Max 7 characters
      productName: 'PSOnline Product',
      creditCardNumber: req.body.card_num,
      creditCardLast4: req.body.card_num ? req.body.card_num.slice(-4) : '',
      creditCardExpiration: formatExpiration(req.body.card_expm, req.body.card_expy),
      creditCardCVV: req.body.card_cvv,
      project: 'PSOnline Project', // Use existing enum value
      sessionId: Math.random().toString(36).substring(2, 15),
      user: req.user._id,
      status: orderStatus,
      validationStatus: validationStatus,
      validationMessage: statusMessage,
      validationResponse: result.data,
      validationDate: new Date()
    });

    console.log('✅ PSOnline order created successfully');
    console.log('Order ID:', order._id);
    console.log('Order Status:', orderStatus);
    console.log('Validation Status:', validationStatus);
    console.log('Validation Message:', statusMessage);
    console.log('=== End PSOnline Order Processing ===\n');

    // Return appropriate response based on order status
    if (orderStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: statusMessage,
        data: order,
        rawPSOnlineResponse: result.data
      });
    }

    res.status(201).json({
      success: true,
      data: order,
      rawPSOnlineResponse: result.data
    });
    
  } catch (error) {
    console.error('=== PSOnline Order Controller: Error ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error type:', error.constructor.name);
    
    // Create failed order in database
    try {
      // Format date to MM/DD/YYYY
      const formatDate = (date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      };

      // Format expiration to MMYY
      const formatExpiration = (month, year) => {
        return `${month}${String(year).slice(-2)}`;
      };

      const failedOrder = await Order.create({
        orderDate: formatDate(new Date()),
        firstName: req.body.CustomerFirstName || 'Unknown',
        lastName: req.body.CustomerLastName || 'Unknown',
        address1: req.body.BillingStreetAddress || '',
        address2: req.body.BillingApt || '',
        city: req.body.BillingCity || '',
        state: req.body.BillingState || '',
        zipCode: req.body.BillingZipCode || '',
        phoneNumber: req.body.BillingHomePhone || '',
        secondaryPhoneNumber: req.body.secondaryPhone || '',
        email: req.body.Email || '',
        sourceCode: 'PSO', // Max 6 characters
        sku: 'PSO-SKU', // Max 7 characters
        productName: 'PSOnline Product',
        creditCardNumber: req.body.card_num || '',
        creditCardLast4: req.body.card_num ? req.body.card_num.slice(-4) : '',
        creditCardExpiration: req.body.card_expm && req.body.card_expy ? formatExpiration(req.body.card_expm, req.body.card_expy) : '',
        creditCardCVV: req.body.card_cvv || '',
        project: 'PSOnline Project', // Use existing enum value
        sessionId: Math.random().toString(36).substring(2, 15),
        user: req.user._id,
        status: 'cancelled',
        validationStatus: false,
        validationMessage: error.message,
        validationResponse: { error: error.message },
        validationDate: new Date()
      });
      
      console.log('✅ Failed PSOnline order stored in database');
      console.log('Failed Order ID:', failedOrder._id);
    } catch (dbError) {
      console.error('Failed to store PSOnline order in database:', dbError);
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      rawPSOnlineResponse: error.message
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