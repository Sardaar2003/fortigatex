const axios = require('axios');
const logger = require('../utils/logger');

class SemprisService {
  constructor() {
    this.baseUrl = "https://cco.api.sempris.com/api/v2/payment";
    this.apiKey = process.env.SEMPRIS_API_KEY;
  }

  async validateCustomer(orderData, user) {
    try {
      // Prepare payload according to Sempris API requirements
      const payload = {
        tracking_number: orderData.tracking_number || crypto.randomUUID(),
        vendor_id: orderData.vendor_id,
        source: orderData.source,
        sku: orderData.sku,
        issuer: orderData.issuer,
        first_name: orderData.first_name,
        last_name: orderData.last_name,
        state: orderData.state,
        city: orderData.city,
        address1: orderData.address1,
        address2: orderData.address2 || '',
        zip: orderData.zip,
        email: orderData.email || '',
        phone: orderData.phone,
        card_number: orderData.card_number,
        card_expiration: orderData.card_expiration,
        card_cvv: orderData.card_cvv,
        client_order_number: orderData.client_order_number || '',
        client_data: orderData.client_data || '',
        pitch_id: orderData.pitch_id || ''
      };

      // Validate required fields
      const requiredFields = {
        tracking_number: payload.tracking_number,
        vendor_id: payload.vendor_id,
        source: payload.source,
        sku: payload.sku,
        issuer: payload.issuer,
        first_name: payload.first_name,
        last_name: payload.last_name,
        state: payload.state,
        city: payload.city,
        address1: payload.address1,
        zip: payload.zip,
        phone: payload.phone,
        card_number: payload.card_number,
        card_expiration: payload.card_expiration,
        card_cvv: payload.card_cvv
      };

      // Validate field lengths and formats
      const validationErrors = [];
      
      // Validate tracking_number (1-36 characters)
      if (payload.tracking_number.length < 1 || payload.tracking_number.length > 36) {
        validationErrors.push('tracking_number must be between 1 and 36 characters');
      }

      // Validate vendor_id (exactly 4 characters)
      if (payload.vendor_id.length !== 4) {
        validationErrors.push('vendor_id must be exactly 4 characters');
      }

      // Validate source (1-6 characters)
      if (payload.source.length < 1 || payload.source.length > 6) {
        validationErrors.push('source must be between 1 and 6 characters');
      }

      // Validate sku (1-7 characters)
      if (payload.sku.length < 1 || payload.sku.length > 7) {
        validationErrors.push('sku must be between 1 and 7 characters');
      }

      // Validate issuer (must be one of the allowed values)
      const validIssuers = ['diners-club', 'discover', 'jcb', 'visa', 'mastercard', 'american-express'];
      if (!validIssuers.includes(payload.issuer)) {
        validationErrors.push('issuer must be one of: ' + validIssuers.join(', '));
      }

      // Validate first_name and last_name (1-30 characters)
      if (payload.first_name.length < 1 || payload.first_name.length > 30) {
        validationErrors.push('first_name must be between 1 and 30 characters');
      }
      if (payload.last_name.length < 1 || payload.last_name.length > 30) {
        validationErrors.push('last_name must be between 1 and 30 characters');
      }

      // Validate state (exactly 2 characters)
      if (payload.state.length !== 2) {
        validationErrors.push('state must be exactly 2 characters');
      }

      // Validate city (1-30 characters)
      if (payload.city.length < 1 || payload.city.length > 30) {
        validationErrors.push('city must be between 1 and 30 characters');
      }

      // Validate address1 (1-50 characters)
      if (payload.address1.length < 1 || payload.address1.length > 50) {
        validationErrors.push('address1 must be between 1 and 50 characters');
      }

      // Validate address2 (0-50 characters)
      if (payload.address2 && payload.address2.length > 50) {
        validationErrors.push('address2 must be between 0 and 50 characters');
      }

      // Validate zip (5 or 9 characters)
      if (!/^\d{5}(\d{4})?$/.test(payload.zip)) {
        validationErrors.push('zip must be 5 or 9 digits');
      }

      // Validate phone (exactly 10 digits)
      if (!/^\d{10}$/.test(payload.phone)) {
        validationErrors.push('phone must be exactly 10 digits');
      }

      // Validate card_number (13-16 digits)
      if (!/^\d{13,16}$/.test(payload.card_number)) {
        validationErrors.push('card_number must be between 13 and 16 digits');
      }

      // Validate card_expiration (4 digits, MMYY format)
      if (!/^(0[1-9]|1[0-2])\d{2}$/.test(payload.card_expiration)) {
        validationErrors.push('card_expiration must be in MMYY format');
      }

      // Validate card_cvv (3-4 digits)
      if (!/^\d{3,4}$/.test(payload.card_cvv)) {
        validationErrors.push('card_cvv must be 3 or 4 digits');
      }

      if (validationErrors.length > 0) {
        return {
          eligible: false,
          reason: validationErrors.join(', '),
          rawResponse: null
        };
      }

      // Log the API call attempt
      logger.userAction(user._id, 'SEMPRIS_API_CALL', {
        tracking_number: payload.tracking_number,
        vendor_id: payload.vendor_id
      });

      // Make API call to Sempris
      const response = await axios.post(this.baseUrl, payload, {
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      // Log successful response
      logger.userAction(user._id, 'SEMPRIS_API_RESPONSE', {
        tracking_number: payload.tracking_number,
        status: response.status,
        transaction_id: response.data.transaction_id
      });

      // Handle successful response (HTTP 200)
      if (response.status === 200) {
        return {
          eligible: response.data.message === 'accepted',
          reason: response.data.message,
          transactionId: response.data.transaction_id,
          rawResponse: response.data
        };
      }

    } catch (error) {
      // Log error
      logger.error(`Sempris API error: ${error.message}`, {
        tracking_number: orderData.tracking_number,
        error: error.response?.data || error.message
      });

      // Handle different types of errors
      if (error.response) {
        // API returned an error response
        const responseData = error.response.data;
        return {
          eligible: false,
          reason: responseData.error_msg || responseData.message || 'API validation failed',
          transactionId: responseData.transaction_id,
          rawResponse: responseData
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          eligible: false,
          reason: 'No response from Sempris API',
          rawResponse: null
        };
      } else {
        // Error in request setup
        return {
          eligible: false,
          reason: 'Error setting up Sempris API request',
          rawResponse: null
        };
      }
    }
  }
}

module.exports = new SemprisService(); 