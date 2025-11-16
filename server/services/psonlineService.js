const axios = require('axios');

class PSOnlineService {
  constructor() {
    this.apiUrl = 'https://app.periodicalservices.com/api/woocommerce/v1.9/process.asp';
    this.apiKey = process.env.PSONLINE_API_KEY;
    this.merchantId = process.env.PSONLINE_MERCHANT_ID;

    // Enhanced debug logging
    console.log('\n=== PSOnlineService Initialization ===');
    console.log('API URL:', this.apiUrl);
    console.log('API Key present:', !!this.apiKey);
    console.log('API Key length:', this.apiKey ? this.apiKey.length : 0);
    console.log('Merchant ID: Using standard MID weights (0)');
    console.log('Environment variables check:', {
      PSONLINE_API_KEY: process.env.PSONLINE_API_KEY ? 'Set' : 'Not Set'
    });
    console.log('====================================\n');
  }

  async processOrder(orderData) {
    try {
      console.log('\n=== PSOnline Service: processOrder Started ===');
      
      // Validate credentials before proceeding
      if (!this.apiKey) {
        console.error('PSOnline API key missing');
        return {
          success: false,
          error: 'PSOnline API key is missing. Please check your environment variables.',
          status: 500,
          data: null
        };
      }

      console.log('PSOnline credentials validated successfully');
      console.log('\n=== Processing PSOnline Order ===');
      console.log('Order data received:', {
        ...orderData,
        card_num: orderData.card_num ? `${orderData.card_num.substring(0, 4)}****${orderData.card_num.substring(-4)}` : 'Missing',
        card_cvv: orderData.card_cvv ? '***' : 'Missing'
      });

      console.log('Building request payload with credentials...');
      console.log('Raw API Key:', this.apiKey);
      console.log('Merchant ID: Using standard MID weights (0)');
      
      const orderDataWithCredentials = {
        ...orderData,
        APIKey: this.apiKey,
        MerchantID: '0', // Set to 0 to use standard MID weights
        bincheck: 1 // Enable BIN checking against internal reject list
      };

      console.log('Request payload prepared:', {
        ...orderDataWithCredentials,
        APIKey: this.apiKey ? `${this.apiKey.substring(0, 4)}...${this.apiKey.substring(-4)}` : 'Missing',
        MerchantID: '0 (standard MID weights)',
        bincheck: orderDataWithCredentials.bincheck
      });
      console.log('PSOnline API URL:', this.apiUrl);

      console.log('Sending request to PSOnline API...');
      console.log('Request URL:', this.apiUrl);
      console.log('Request method: POST');
      console.log('Request headers:', {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'PSOnline-Client'
      });
      
      // Convert data to URL-encoded format
      const formData = new URLSearchParams();
      Object.keys(orderDataWithCredentials).forEach(key => {
        if (orderDataWithCredentials[key] !== null && orderDataWithCredentials[key] !== undefined) {
          formData.append(key, orderDataWithCredentials[key]);
        }
      });
      
      console.log('Form data being sent:', formData.toString());
      console.log('Form data entries:');
      for (let [key, value] of formData.entries()) {
        if (key === 'APIKey' || key === 'MerchantID') {
          console.log(`  ${key}: ${value ? 'Present' : 'Missing'} (length: ${value ? value.length : 0})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
      
      const response = await axios.post(this.apiUrl, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'PSOnline-Client'
        }
      });
      // console.log('=== PSOnline API Response Details ===');
      // console.log('Response status:', response.status);
      // console.log('Response status text:', response.statusText);
      // console.log('Response headers:', JSON.stringify(response.headers, null, 2));
      // console.log('Response data (raw):', JSON.stringify(response.data, null, 2));
      // console.log('Response data type:', typeof response.data);
      // console.log('Response data keys:', Object.keys(response.data || {}));
      // console.log('Full response object:', response);
      
      // // Check if response.data is a string that needs parsing
      // let processedResponse = response.data;
      // if (typeof response.data === 'string') {
      //   console.log('Response is a string, attempting to parse...');
      //   try {
      //     processedResponse = JSON.parse(response.data);
      //     console.log('Successfully parsed string response:', processedResponse);
      //   } catch (parseError) {
      //     console.log('Could not parse as JSON, using as-is');
      //     processedResponse = response.data;
      //   }
      // }
      
      // console.log('Final processed response:', processedResponse);
      // console.log('====================================\n');

      // Return the response data in a consistent format
      return {
        success: true,
        status: response.status,
        data: response.data,
        headers: response.headers
      };
    } catch (error) {
      console.error('\n=== PSOnline API Error ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error stack:', error.stack);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Response headers:', error.response?.headers);
      console.error('Request config:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });
      console.error('====================================\n');

      // Return error in consistent format
      return {
        success: false,
        error: error.response?.data?.ResponseData || error.message,
        status: error.response?.status,
        data: error.response?.data
      };
    }
  }

  validateOrderData(orderData) {
    console.log('\n=== PSOnline Service: validateOrderData Started ===');
    console.log('Validating order data:', {
      ...orderData,
      card_num: orderData.card_num ? `${orderData.card_num.substring(0, 4)}****${orderData.card_num.substring(-4)}` : 'Missing',
      card_cvv: orderData.card_cvv ? '***' : 'Missing'
    });
    
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

    console.log('Checking required fields...');
    const missingFields = requiredFields.filter(field => !orderData[field]);
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    console.log('All required fields present');

    // BIN and state rejection validation is now handled on the frontend order form.

    // Validate card number format (15-16 digits)
    console.log('Validating card number format...');
    if (!/^\d{15,16}$/.test(orderData.card_num.replace(/\s/g, ''))) {
      console.error('Invalid card number format');
      throw new Error('Invalid card number format (must be 15 or 16 digits)');
    }
    console.log('Card number format valid');

    // Validate CVV format (3-4 digits)
    console.log('Validating CVV format...');
    if (!/^\d{3,4}$/.test(orderData.card_cvv)) {
      console.error('Invalid CVV format');
      throw new Error('Invalid CVV format (must be 3 or 4 digits)');
    }
    console.log('CVV format valid');

    // Validate phone number format (10 digits)
    console.log('Validating phone number format...');
    if (!/^\d{10}$/.test(orderData.BillingHomePhone.replace(/\D/g, ''))) {
      console.error('Invalid phone number format');
      throw new Error('Invalid phone number format (must be 10 digits)');
    }
    console.log('Phone number format valid');

    // Validate email format
    console.log('Validating email format...');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderData.Email)) {
      console.error('Invalid email format');
      throw new Error('Invalid email format');
    }
    console.log('Email format valid');

    // Validate date formats
    if (orderData.DOB) {
      console.log('Validating DOB format...');
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(orderData.DOB)) {
        console.error('Invalid DOB format');
        throw new Error('Invalid date format (must be MM/DD/YYYY)');
      }
      console.log('DOB format valid');
    }

    // Validate Gender if provided
    if (orderData.Gender) {
      console.log('Validating Gender...');
      if (!['M', 'F'].includes(orderData.Gender)) {
        console.error('Invalid Gender value');
        throw new Error('Gender must be M or F');
      }
      console.log('Gender valid');
    }

    // Validate amount is a positive number
    console.log('Validating amount...');
    if (isNaN(orderData.amount) || orderData.amount <= 0) {
      console.error('Invalid amount');
      throw new Error('Amount must be a positive number');
    }
    console.log('Amount valid:', orderData.amount);

    console.log('=== PSOnline Service: validateOrderData Completed Successfully ===\n');
    return true;
  }
}

module.exports = new PSOnlineService(); 