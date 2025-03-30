const axios = require('axios');
const logger = require('../utils/logger');

class SemprisService {
  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://cco.api.sempris.com/api/v2/payment'
      : 'https://dev.cco.api.sempris.com/api/v2/payment';
    this.apiKey = process.env.SEMPRIS_API_KEY;
  }

  async validateCustomer(orderData, user) {
    try {
      // Prepare payload according to Sempris API requirements
      const payload = {
        tracking_number: orderData.sessionId,
        vendor_id: orderData.vendorId,
        source: orderData.sourceCode,
        sku: orderData.sku,
        issuer: orderData.cardIssuer,
        first_name: orderData.firstName,
        last_name: orderData.lastName,
        state: orderData.state,
        city: orderData.city,
        address1: orderData.address1,
        address2: orderData.address2 || '',
        zip: orderData.zipCode,
        email: orderData.email || '',
        phone: orderData.phoneNumber,
        card_number: orderData.creditCardNumber,
        card_expiration: orderData.creditCardExpiration,
        card_cvv: orderData.creditCardCVV,
        client_order_number: orderData.clientOrderNumber || '',
        client_data: orderData.clientData || '',
        pitch_id: orderData.pitchId || ''
      };

      // Log the API call attempt
      logger.userAction(user._id, 'SEMPRIS_API_CALL', {
        sessionId: orderData.sessionId,
        vendorId: orderData.vendorId
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
        sessionId: orderData.sessionId,
        status: response.data.message,
        transactionId: response.data.transaction_id
      });

      return {
        eligible: response.data.message === 'accepted',
        reason: response.data.message === 'accepted' ? 'Validation successful' : 'Order rejected by Sempris',
        transactionId: response.data.transaction_id,
        rawResponse: response.data
      };

    } catch (error) {
      // Log error
      logger.error(`Sempris API error: ${error.message}`, {
        sessionId: orderData.sessionId,
        error: error.response?.data || error.message
      });

      // Handle different types of errors
      if (error.response) {
        // API returned an error response
        return {
          eligible: false,
          reason: error.response.data.error_msg || 'API validation failed',
          transactionId: error.response.data.transaction_id,
          rawResponse: error.response.data
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