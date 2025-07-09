const axios = require('axios');

class PSOnlineService {
  constructor() {
    this.apiUrl = 'https://app.periodicalservices.com/api/woocommerce/v1.4/process.asp';
    this.apiKey = process.env.PSONLINE_API_KEY;
    this.merchantId = process.env.PSONLINE_MERCHANT_ID;

    // Enhanced debug logging
    console.log('\n=== PSOnlineService Initialization ===');
    console.log('API Key:', this.apiKey ? 'Present' : 'Missing');
    console.log('Merchant ID:', this.merchantId ? 'Present' : 'Missing');
    console.log('Environment variables:', {
      PSONLINE_API_KEY: process.env.PSONLINE_API_KEY ? 'Present' : 'Missing',
      PSONLINE_MERCHANT_ID: process.env.PSONLINE_MERCHANT_ID ? 'Present' : 'Missing'
    });
    console.log('====================================\n');
  }

  async processOrder(orderData) {
    try {
      // Validate credentials before proceeding
      if (!this.apiKey || !this.merchantId) {
        throw new Error('PSOnline credentials are missing. Please check your environment variables.');
      }

      console.log('\n=== Processing PSOnline Order ===');
      console.log('Order data:', {
        ...orderData,
        card_num: orderData.card_num ? 'Present' : 'Missing',
        card_cvv: orderData.card_cvv ? 'Present' : 'Missing'
      });

      const orderDataWithCredentials = {
        ...orderData,
        APIKey: this.apiKey,
        MerchantID: this.merchantId
      };

      console.log('Request payload:', {
        ...orderDataWithCredentials,
        APIKey: this.apiKey ? 'Present' : 'Missing',
        MerchantID: this.merchantId ? 'Present' : 'Missing'
      });

      const response = await axios.post(this.apiUrl, orderDataWithCredentials);
      console.log('PSOnline API Response:', response.data);
      console.log('====================================\n');

      return response.data;
    } catch (error) {
      console.error('\n=== PSOnline API Error ===');
      console.error('Error message:', error.message);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Response headers:', error.response?.headers);
      console.error('====================================\n');

      throw new Error(error.response?.data?.ResponseData || 'Failed to process order with PSOnline');
    }
  }

  validateOrderData(orderData) {
    const requiredFields = [
      'domain',
      'card_num',
      'card_expm',
      'card_expy',
      'card_cvv',
      'CustomerFirstName',
      'CustomerLastName',
      'BillingStreetAddress',
      'BillingCity',
      'BillingState',
      'BillingZipCode',
      'Email',
      'BillingHomePhone',
      'amount',
      'ProductCount'
    ];

    const missingFields = requiredFields.filter(field => !orderData[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate card number format (15-16 digits)
    if (!/^\d{15,16}$/.test(orderData.card_num.replace(/\s/g, ''))) {
      throw new Error('Invalid card number format (must be 15 or 16 digits)');
    }

    // Validate CVV format (3-4 digits)
    if (!/^\d{3,4}$/.test(orderData.card_cvv)) {
      throw new Error('Invalid CVV format (must be 3 or 4 digits)');
    }

    // Validate phone number format (10 digits)
    if (!/^\d{10}$/.test(orderData.BillingHomePhone.replace(/\D/g, ''))) {
      throw new Error('Invalid phone number format (must be 10 digits)');
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderData.Email)) {
      throw new Error('Invalid email format');
    }

    // Validate date formats
    if (orderData.DOB && !/^\d{2}\/\d{2}\/\d{4}$/.test(orderData.DOB)) {
      throw new Error('Invalid date format (must be MM/DD/YYYY)');
    }

    // Validate amount is a positive number
    if (isNaN(orderData.amount) || orderData.amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    return true;
  }
}

module.exports = new PSOnlineService(); 