const axios = require('axios');
const logger = require('../utils/logger');

const binNumbers = [
  "533248", "542418", "518941", "517805", "410040", "426937", "498563", "481582",
  "414740", "474476", "423980", "601100", "528432", "483316", "552433", "537811",
  "555426", "529062", "544768", "510855", "510889", "554869", "411600", "434340",
  "411238", "414397", "546993", "555753", "545660", "522992", "549345", "554885",
  "542543", "524913", "434257", "446542", "407221", "482812", "445170", "474165",
  "411384", "442644", "470727", "473702", "434256", "473703", "434258", "521333",
  "524366", "546680", "524300", "524306", "521853", "552330", "524008", "524363",
  "524364", "444796", "470793", "525362", "511332", "510404", "539483", "532802",
  "434769", "483312", "406032", "474472", "412197", "461046", "444296", "400022",
  "486796", "526219"
];

class SublyticsService {
  constructor() {
    this.baseUrl = "https://globalmarketingpartners.sublytics.com/api/order/doAddProcess";
    this.apiKey = process.env.SUBLYTICS_USER_PASSWORD;
    }
    

  async validateCustomer(orderData, user) {
    try {
      const payload = {
    user_id: orderData.user_id,
    user_password: this.apiKey,
    connection_id: orderData.connection_id,
    payment_method_id: orderData.payment_method_id,
    campaign_id: Number(orderData.campaign_id),
    offers: orderData.offers,
    currency_id: orderData.currency_id,

    email: orderData.email,
    phone: orderData.phone,

    bill_fname: orderData.bill_fname,
    bill_lname: orderData.bill_lname,
    bill_organization: orderData.bill_organization,
    bill_country: orderData.bill_country,
    bill_address1: orderData.bill_address1,
    bill_address2: orderData.bill_address2,
    bill_city: orderData.bill_city,
    bill_state: orderData.bill_state,
    bill_zipcode: orderData.bill_zipcode,

    shipping_same: orderData.shipping_same,

    card_type_id: orderData.card_type_id,
    card_number: orderData.card_number,
    card_cvv: orderData.card_cvv,
    card_exp_month: orderData.card_exp_month,
    card_exp_year: orderData.card_exp_year,

    tracking1: orderData.tracking1,
    tracking2: orderData.tracking2
  };

  // Include shipping fields only if shipping_same is false
  if (!orderData.shipping_same) {
    Object.assign(payload, {
      ship_fname: orderData.ship_fname,
      ship_lname: orderData.ship_lname,
      ship_organization: orderData.ship_organization,
      ship_country: orderData.ship_country,
      ship_address1: orderData.ship_address1,
      ship_address2: orderData.ship_address2,
      ship_city: orderData.ship_city,
      ship_state: orderData.ship_state,
      ship_zipcode: orderData.ship_zipcode
    });
  }

      // Extract payload
const validationErrors = [];

// Validate universally required fields
const requiredFields = [
  'user_id', 'user_password', 'connection_id', 'payment_method_id', 'campaign_id', 'currency_id', 'offers'
];

requiredFields.forEach(field => {
  if (!payload[field]) {
    validationErrors.push(`${field} is required`);
  }
});

// Validate offers
if (!Array.isArray(payload.offers) || payload.offers.length === 0) {
  validationErrors.push('offers must be a non-empty array');
} else {
  payload.offers.forEach((offer, index) => {
    if (!offer.offer_id) {
      validationErrors.push(`offers[${index}].offer_id is required`);
    }
    if (!offer.order_offer_quantity) {
      validationErrors.push(`offers[${index}].order_offer_quantity is required`);
    }
  });
}

// Validate customer info
if (!payload.customer_id) {
  const billingFields = [
    'email', 'phone', 'bill_fname', 'bill_lname',
    'bill_country', 'bill_address1', 'bill_city', 'bill_zipcode'
  ];
  billingFields.forEach(field => {
    if (!payload[field]) {
      validationErrors.push(`${field} is required because customer_id is not provided`);
    }
  });

  if (['US', 'CA'].includes(payload.bill_country)) {
    if (!payload.bill_state || payload.bill_state.length !== 2) {
      validationErrors.push('bill_state is required and must be 2 characters for US/CA billing');
    }
  }
}

// Validate shipping if shipping_same is false
if (payload.shipping_same === false) {
  const shippingFields = [
    'ship_fname', 'ship_lname', 'ship_country',
    'ship_address1', 'ship_city', 'ship_zipcode'
  ];
  shippingFields.forEach(field => {
    if (!payload[field]) {
      validationErrors.push(`${field} is required when shipping_same is false`);
    }
  });

  if (['US', 'CA'].includes(payload.ship_country)) {
    if (!payload.ship_state || payload.ship_state.length !== 2) {
      validationErrors.push('ship_state is required and must be 2 characters for US/CA shipping');
    }
  }
}

// Validate card details if payment method is credit card
if (payload.payment_method_id === 1) {
  const cardFields = ['card_type_id', 'card_number', 'card_exp_month', 'card_exp_year'];
  cardFields.forEach(field => {
    if (!payload[field]) {
      validationErrors.push(`${field} is required for credit card payment`);
    }
  });

  // Format checks
  if (payload.card_number && !/^\d{13,16}$/.test(payload.card_number)) {
    validationErrors.push('card_number must be 13-16 digits');
  }

  if (payload.card_exp_month && !/^(0[1-9]|1[0-2])$/.test(payload.card_exp_month)) {
    validationErrors.push('card_exp_month must be 01 to 12');
  }

  if (payload.card_exp_year && !/^\d{4}$/.test(payload.card_exp_year)) {
    validationErrors.push('card_exp_year must be 4 digits');
  }

  if (payload.card_cvv && !/^\d{3,4}$/.test(payload.card_cvv)) {
    validationErrors.push('card_cvv must be 3 or 4 digits');
  }
}

// Final return
if (validationErrors.length > 0) {
  return {
    eligible: false,
    reason: validationErrors.join(', '),
    rawResponse: null
  };
        }
        
// Validate BIN reject list - check if card number starts with rejected BIN
    console.log('Checking BIN validation...');
    const cardNumber = payload.card_number.replace(/\s/g, '');
    const cardBin = (cardNumber.substring(0, 6));
    console.log('Card BIN:', cardBin);
    if (binNumbers.includes(cardBin)) {
      console.error('BIN rejected:', cardBin);
      throw new Error(`This card type is not currently accepted. Please use a different payment method.`);
    }
    console.log('BIN validation passed');
        console.log('payload', payload);


      // Make API call to Sempris
      const response = await axios.post(this.baseUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Log successful response
      logger.userAction(user._id, 'SUBLYTICS_API_RESPONSE', {
        tracking_number: payload.tracking_number,
        status: response.status,
        transaction_id: response.data.transaction_id
      });
        console.log("Response : ", response);
        console.log("Response Data : ", response.data);
        
    //   // Handle successful response (HTTP 200)
      if (response.status === 200) {
        const transaction = response.data.transaction || {};

        return {
            eligible: transaction.success === 1,
            reason: transaction.response || response.data.message,
            transactionId: transaction.transaction_id || response.data.transaction_id || null,
            totalAmount: transaction.transaction_total || null,
            gateway: {
            response_id: transaction.gateway_response_id,
            gateway_id: transaction.gateway_response_gateway_id,
            code: transaction.gateway_response_code,
            auth_code: transaction.gateway_auth_code,
            cvv: transaction.gateway_response_cvv,
            avs: transaction.gateway_response_avs
            },
            customer_id: transaction.customer_id || null,
            order_id: transaction.order_id || null,
            order_info: transaction.order || {},
            shipment_id: transaction.shipment_id || null,
            post_url: transaction.post_data || null,
            rawResponse: response.data // for debugging/logging
        };
    }

      if (response.status === 400) {
        const transaction = response.data.data?.transaction || {};

        return {
            eligible: false,
            reason: response.data.message || response.data.error_msg?.[0]?.message || 'Unknown error',
            transactionId: transaction.transaction_id || response.data.transaction_id || null,
            orderId: response.data.data?.order?.id || transaction.order_id || null,
            customerId: transaction.customer_id || null,
            gateway: {
            response_id: transaction.gateway_response_id,
            gateway_id: transaction.gateway_response_gateway_id,
            code: transaction.gateway_response_code,
            auth_code: transaction.gateway_auth_code,
            cvv: transaction.gateway_response_cvv,
            avs: transaction.gateway_response_avs
            },
            rawResponse: response.data
  };
}



    } catch (error) {
  // Log error
  logger.error(`Sublytics API error: ${error.message}`, {
    tracking_number: orderData.tracking_number,
    error: error.response?.data || error.message
  });

  // Handle different types of errors
  if (error.response) {
    const transaction = error.response.data?.data?.transaction || {};

    return {
      eligible: false,
      reason: error.response.data?.message || error.response.data?.error_msg?.[0]?.message || 'Unknown error',
      transactionId: transaction.transaction_id || error.response.data?.transaction_id || null,
      orderId: error.response.data?.data?.order?.id || transaction.order_id || null,
      customerId: transaction.customer_id || null,
      gateway: {
        response_id: transaction.gateway_response_id,
        gateway_id: transaction.gateway_response_gateway_id,
        code: transaction.gateway_response_code,
        auth_code: transaction.gateway_auth_code,
        cvv: transaction.gateway_response_cvv,
        avs: transaction.gateway_response_avs
      },
      rawResponse: error.response.data
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      eligible: false,
      reason: 'No response from SUBLYTICS API',
      rawResponse: null
    };
  } else {
    // Error in request setup
    return {
      eligible: false,
      reason: 'Error setting up SUBLYTICS API request',
      rawResponse: null
    };
  }

    }
  }
}

module.exports = new SublyticsService(); 