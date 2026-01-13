const Order = require('../models/Order');
const asyncHandler = require('express-async-handler');
const logger = require('../utils/logger');
const radiusService = require('../services/radiusService');
const semprisService = require('../services/semprisService');
const psonlineService = require('../services/psonlineService');
const sublyticsService = require('../services/sublyticsService');
const { submitImportSale } = require('../services/importSaleService');
// Initialize NeverBounce client
// content: The user explicitly provided this key in the request
// Fix: Use .default if available (common in some build configurations) and use env var
// Initialize NeverBounce client
const NB = require('neverbounce');
// Use explicit default import as verified in testing
const NeverBounce = NB.default || NB;
const nbClient = new NeverBounce({ apiKey: process.env.NEVERBOUNCE_API_KEY });

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
      project: 'MDI Project', // Use existing enum value
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

const processSublyticsOrder = asyncHandler(async (req, res) => {
  console.log('Processing Sublytics order...');
  console.log('Request body:', req.body);
  console.log('User ID:', req.user._id);
  const formatDate = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };
  try {
    // Validate customer with Sempris service
    console.log('\n=== Sublytics Service Validation ===');
    const validationResult = await sublyticsService.validateCustomer(req.body, req.user);
    console.log('Sublytics API Response:', validationResult);

    // Determine order status based on Sempris response
    let orderStatus = 'pending';
    let validationStatus = false;
    let statusMessage = '';

    if (validationResult.eligible) {
      orderStatus = 'completed';
      validationStatus = true;
      statusMessage = 'Order accepted by Sublytics';
    } else {
      orderStatus = 'cancelled';
      validationStatus = false;
      statusMessage = validationResult.reason || 'Order rejected by Sublytics';
    }

    // Extract transaction details if available
    const transaction = validationResult.rawResponse?.data?.transaction || {};
    const orderData = validationResult.rawResponse?.data?.order || {};

    console.log('\n=== Database Operation ===');
    console.log('Creating Sublytics order in database...');

    const project = 'HPP Project'; // or 'SC Project', 'sempris', etc.
    const cardTypeMap = {
      1: 'mastercard',
      2: 'visa',
      3: 'discover',
      4: 'american-express'
    };
    const month = req.body.card_exp_month.padStart(2, '0'); // Ensures 2-digit month
    const year = req.body.card_exp_year.slice(-2);          // Takes last two digits of year

    const creditCardExpiration = month + year;              // e.g., '0527'

    const orderPayload = {
      orderDate: formatDate(new Date()),  // Use correct format for validation
      firstName: req.body.bill_fname,
      lastName: req.body.bill_lname,
      address1: req.body.bill_address1,
      address2: req.body.bill_address2 || '',
      city: req.body.bill_city,
      state: req.body.bill_state,
      zipCode: req.body.bill_zipcode,
      phoneNumber: req.body.phone,
      email: req.body.email || null,
      productName: 'SUB Product',
      creditCardNumber: req.body.card_number,         // ADD THIS (required field)
      creditCardLast4: req.body.card_number?.slice(-4),
      creditCardExpiration: creditCardExpiration, // REQUIRED
      creditCardCVV: req.body.card_cvv,
      cardIssuer: cardTypeMap[req.body.card_type_id],

      sourceCode: req.body.source_code || '',         // If required for project
      sku: req.body.sku || '',                        // Same
      sessionId: req.body.session_id || '',           // Same

      project: project, // make sure this is "HPP Project"

      user: req.user.id,

      transactionId: transaction.gateway_response_id || validationResult.transactionId || null,
      transactionDate: transaction.date_response || new Date(),
      customerId: transaction.customer_id || null,
      sublyticssOrderId: orderData.id || transaction.order_id || null,

      gatewayResponse: {
        gatewayId: transaction.gateway_response_gateway_id,
        responseCode: transaction.gateway_response_code,
        description: transaction.gateway_response_description,
        authCode: transaction.gateway_auth_code,
        avs: transaction.gateway_response_avs,
        cvv: transaction.gateway_response_cvv
      },

      status: orderStatus,
      validationStatus: validationStatus,
      validationMessage: statusMessage,
      validationResponse: validationResult.rawResponse,
      validationDate: new Date()
    };


    // ✅ Add these conditionally
    if (project === 'SC Project' || project === 'sempris') {
      orderPayload.sourceCode = req.body.source;
      orderPayload.sku = req.body.sku;
    }

    if (project === 'SC Project') {
      orderPayload.vendorId = req.body.vendor_id;
      orderPayload.sessionId = req.body.tracking_number;
    }

    const order = await Order.create(orderPayload);


    console.log('✅ Order created successfully');
    console.log('Order ID:', order._id);
    console.log('Order Status:', orderStatus);
    console.log('Validation Status:', validationStatus);
    console.log('Validation Message:', statusMessage);
    console.log('=== End Sublytics Order Processing ===\n');

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
    console.error('\n❌ Error in Sublytics Order Processing');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Error details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });
    console.log('=== End Sublytics Order Processing with Error ===\n');

    res.status(500).json({
      success: false,
      message: err.response?.data,
      error: err.message
    });
  }

});

// @desc    Verify email with NeverBounce
// @route   POST /api/orders/verify-email
// @access  Private
const verifyEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  try {
    const result = await nbClient.single.check(email);
    console.log('NeverBounce Result:', result.getResult());

    // result.result can be: 'valid', 'invalid', 'disposable', 'catchall', 'unknown'
    // We only allow 'valid' as per requirement ("Only if the result is valid it would go ahead")

    // However, in many real-world cases, 'catchall' and 'unknown' might be acceptable depending on risk tolerance.
    // The user specifically said: "Only if the result is valid it would go ahead ... else return fake email id"

    // Use .is() method or .getResult() to check status
    if (result.is(NeverBounce.result.valid)) {
      console.log('Email is valid');
      return res.status(200).json({
        success: true,
        data: result
      });
    } else {
      console.log('Issue: Email not valid. Status:', result.getResult());
      // Return error as requested
      return res.status(400).json({
        success: false,
        message: 'Invalid email address provided',
        reason: result.getResult(), // valid, invalid, disposable, etc.
        details: result
      });
    }

  } catch (error) {
    console.error('NeverBounce Error:', error);
    // If NeverBounce fails, we might want to fail open or closed. 
    // Given the strict requirement, I'll error out.
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
      error: error.message
    });
  }
});

// @desc    Process ImportSale order (Boilfrog importSale)
// @route   POST /api/orders/import-sale
// @access  Private
const processImportSaleOrder = asyncHandler(async (req, res) => {
  console.log('=== Starting ImportSale Order Processing ===');
  console.log('Incoming Body keys:', Object.keys(req.body));

  const {
    FIRSTNAME,
    LASTNAME,
    BILLINGNAME,
    EMAIL,
    HOMEAREA,
    HOMEPHONE,
    BILLADDR1,
    BILLADDR2 = '',
    BILLCITY,
    BILLSTATE,
    BILLZIP,
    BILLCOUNTRY,
    PAYMETHOD,
    ACCTNUM,
    ROUTENUM,
    CREDNUM,
    CREDEXP,
    CVV2,
    PRODID,
    PROMOID,
    COMPANYID,
    TRACKINGID,
    RETNUM,
    SALESID,
    SOURCEID,
    ORDERSOURCE
  } = req.body;

  const required = {
    FIRSTNAME,
    LASTNAME,
    BILLINGNAME,
    EMAIL,
    HOMEAREA,
    HOMEPHONE,
    BILLADDR1,
    BILLCITY,
    BILLSTATE,
    BILLZIP,
    BILLCOUNTRY,
    PAYMETHOD,
    PRODID,
    PROMOID,
    COMPANYID,
    SOURCEID
  };

  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length) {
    console.log('Validation Failed. Missing fields:', missing);
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missing.join(', ')}`
    });
  }
  console.log('Basic validation passed.');

  // Validate Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(EMAIL)) {
    console.log('Validation Failed. Invalid Email:', EMAIL);
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }
  console.log('Email validation passed.');

  // Check for duplicate order
  const existingOrder = await Order.findOne({
    email: EMAIL.toLowerCase(),
    productName: PRODID,
    status: 'completed',
    project: 'IMPORTSALE Project'
  });

  if (existingOrder) {
    console.log('Duplicate order found:', existingOrder._id);
    return res.status(400).json({
      success: false,
      message: 'Duplicate order: An order for this product with this email already exists.'
    });
  }
  console.log('Duplicate check passed. No existing order.');

  const method = PAYMETHOD.toUpperCase();
  if (method === 'CH') {
    if (!ACCTNUM || !ROUTENUM) {
      return res.status(400).json({
        success: false,
        message: 'ACCTNUM and ROUTENUM are required for ACH (CH) payments'
      });
    }
    if (!/^[0-9]{9}$/.test(ROUTENUM)) {
      return res.status(400).json({
        success: false,
        message: 'ROUTENUM must be 9 digits'
      });
    }
  } else {
    if (!CREDNUM || !CREDEXP || !CVV2) {
      return res.status(400).json({
        success: false,
        message: 'CREDNUM, CREDEXP, and CVV2 are required for card payments'
      });
    }
    if (!/^[0-9]{13,16}$/.test(CREDNUM)) {
      return res.status(400).json({
        success: false,
        message: 'CREDNUM must be 13-16 digits'
      });
    }
    if (!/^(0[1-9]|1[0-2])\d{2}$/.test(CREDEXP)) {
      return res.status(400).json({
        success: false,
        message: 'CREDEXP must be in MMYY format'
      });
    }
    if (!/^[0-9]{3,4}$/.test(CVV2)) {
      return res.status(400).json({
        success: false,
        message: 'CVV2 must be 3-4 digits'
      });
    }
  }

  // Build API payload - direct pass-through of uppercase keys
  const payload = {
    FIRSTNAME,
    LASTNAME,
    BILLINGNAME,
    EMAIL,
    HOMEAREA,
    HOMEPHONE,
    BILLADDR1,
    BILLADDR2,
    BILLCITY,
    BILLSTATE: BILLSTATE.toUpperCase(),
    BILLZIP,
    BILLCOUNTRY,
    PAYMETHOD: method,
    ACCTNUM: method === 'CH' ? ACCTNUM : undefined,
    ROUTENUM: method === 'CH' ? ROUTENUM : undefined,
    CREDNUM: method !== 'CH' ? CREDNUM : undefined,
    CREDEXP: method !== 'CH' ? CREDEXP : undefined,
    CVV2: method !== 'CH' ? CVV2 : undefined,
    PRODID,
    PROMOID,
    COMPANYID,
    TRACKINGID,
    RETNUM,
    SALESID,
    SOURCEID,
    ORDERSOURCE
  };

  console.log('Payload prepared for service:', JSON.stringify(payload, null, 2));

  console.log('Calling submitImportSale...');

  const serviceResult = await submitImportSale(payload, req.user);
  console.log('submitImportSale returned:', JSON.stringify(serviceResult, null, 2));

  const attributes = serviceResult.data?.data?.attributes;
  const resultString = attributes?.result;
  let message = attributes?.message;
  let validationResponse = serviceResult.data || serviceResult.error;

  // Handle upstream error format: { errors: [{ title, detail }] }
  if (!serviceResult.success && serviceResult.error?.errors?.length > 0) {
    const errObj = serviceResult.error.errors[0];
    message = `${errObj.title}: ${errObj.detail}`;
    validationResponse = serviceResult.error;
  } else if (!message) {
    if (typeof serviceResult.error === 'object') {
      // Force stringify to ensure full error details are captured
      message = JSON.stringify(serviceResult.error, null, 2);
    } else {
      message = serviceResult.error || 'Unknown response';
    }
  }

  const approved = serviceResult.success && resultString === 'APPROVE';
  const upstreamOrderId = attributes?.orderid;

  const formatDate = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const phoneCombined = `${HOMEAREA}${HOMEPHONE}`;
  const orderPayload = {
    user: req.user._id,
    project: 'IMPORTSALE Project',
    orderDate: formatDate(new Date()),
    firstName: FIRSTNAME,
    lastName: LASTNAME,
    billingName: BILLINGNAME,
    email: EMAIL,
    homeArea: HOMEAREA,
    homePhone: HOMEPHONE,
    address1: BILLADDR1,
    address2: BILLADDR2,
    city: BILLCITY,
    state: BILLSTATE.toUpperCase(),
    zipCode: BILLZIP,
    phoneNumber: phoneCombined,
    sourceCode: String(SOURCEID).slice(0, 6),
    sku: String(PRODID).slice(0, 7),
    productName: PRODID,
    sessionId: TRACKINGID,
    status: approved ? 'completed' : 'cancelled',
    validationStatus: approved,
    validationMessage: message,
    validationResponse: validationResponse,
    validationDate: new Date(),
    OrderID: upstreamOrderId ? String(upstreamOrderId) : undefined
  };

  if (EMAIL) orderPayload.email = EMAIL;

  if (method !== 'CH') {
    orderPayload.creditCardNumber = CREDNUM;
    orderPayload.creditCardLast4 = CREDNUM.slice(-4);
    orderPayload.creditCardExpiration = CREDEXP;
  }

  // Persist order (best-effort; still return API outcome)
  try {
    await Order.create(orderPayload);
  } catch (dbErr) {
    logger.error('Failed to persist importSale order', { error: dbErr.message });
  }

  if (!approved) {
    return res.status(serviceResult.status || 400).json({
      success: false,
      message,
      rawResponse: validationResponse
    });
  }

  res.status(201).json({
    success: true,
    data: serviceResult.data?.data || {},
    orderId: upstreamOrderId,
    message
  });
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

// @desc    Process MI order
// @route   POST /api/orders/mi
// @access  Private
const processMIOrder = asyncHandler(async (req, res) => {
  const {
    callDate,
    firstName,
    lastName,
    address1,
    address2,
    city,
    state,
    zipCode,
    phoneNumber,
    checkingAccountName,
    bankName,
    routingNumber,
    checkingAccountNumber,
    authorizedSigner,
    ageConfirmation,
    email,
    dateOfBirth,
    consent,
    orderNumber
  } = req.body;

  // ✅ Validate required fields
  const requiredFields = {
    callDate,
    firstName,
    lastName,
    address1,
    city,
    state,
    zipCode,
    phoneNumber,
    checkingAccountName,
    bankName,
    routingNumber,
    checkingAccountNumber,
    authorizedSigner,
    ageConfirmation,
    email,
    dateOfBirth,
    consent
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([key, value]) => {
      // Check if field is missing or empty
      if (!value) return true;

      // Special validation for specific fields
      if (key === 'authorizedSigner' && value !== 'YES') return true;
      if (key === 'ageConfirmation' && value !== 'YES') return true;
      if (key === 'consent') {
        // Support combined Benefits+ID Theft consent
        if (typeof value === 'object' && value !== null) {
          const {
            benefitsSavings,
            idTheftProtection,
            benefitsIdTheft,
            myTelemedicine
          } = value;
          const normalizedBenefits = benefitsIdTheft || benefitsSavings || false;
          const normalizedIdTheft = benefitsIdTheft || idTheftProtection || false;
          const anySelected = Boolean(normalizedBenefits || normalizedIdTheft || myTelemedicine);
          if (!anySelected) return true;
        } else {
          return true;
        }
      }
      return false;
    })
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing or invalid required fields: ${missingFields.join(', ')}`
    });
  }

  // ✅ Block restricted US states
  const restrictedStates = ['IA', 'WI', 'MS', 'MN'];
  if (restrictedStates.includes(state.toUpperCase())) {
    return res.status(400).json({
      success: false,
      message: `Orders from ${state} cannot be accepted`
    });
  }

  try {
    // Create the order in the database
    // Normalize consent for storage
    const normalizedConsent = {
      ...consent,
      benefitsIdTheft: Boolean(consent?.benefitsIdTheft || consent?.benefitsSavings || consent?.idTheftProtection)
    };
    console.log(req.body);
    const order = await Order.create({
      user: req.user.id,
      project: 'MI Project',
      callDate,
      firstName,
      lastName,
      address1,
      address2,
      city,
      state,
      zipCode,
      phoneNumber,
      email,
      dateOfBirth,
      // MI-specific fields
      checkingAccountName,
      bankName,
      routingNumber,
      checkingAccountNumber,
      authorizedSigner,
      ageConfirmation,
      consent: normalizedConsent,
      // Store individual consent options (legacy fields)
      consentBenefitsSavings: Boolean(consent?.benefitsIdTheft || consent?.benefitsSavings),
      consentIdTheftProtection: Boolean(consent?.benefitsIdTheft || consent?.idTheftProtection),
      consentMyTelemedicine: Boolean(consent?.myTelemedicine),
      status: 'completed',
      OrderID: orderNumber,
      source: 'MI Project'
    });

    res.status(201).json({
      success: true,
      message: 'MI Order created successfully',
      data: {
        orderId: order._id,
        project: order.project,
        status: order.status
      }
    });

  } catch (error) {
    logger.error('Error creating MI order:', error);
    logger.error('Request body:', req.body);
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Failed to create MI order',
      error: error.message
    });
  }
});

module.exports = {
  processRadiusOrder,
  processSemprisOrder,
  processPSOnlineOrder,
  processSublyticsOrder,
  processImportSaleOrder,
  processMIOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getMyOrders,
  verifyEmail
};