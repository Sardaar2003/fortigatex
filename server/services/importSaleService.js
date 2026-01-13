const axios = require('axios');
const logger = require('../utils/logger');

const IMPORT_SALE_URL = 'https://api.boilfrog.com/oms/xml-proxy/importSale';
const IMPORT_SALE_TOKEN = process.env.IMPORTSALE_API_TOKEN;

/**
 * Call Boilfrog importSale endpoint.
 * @param {object} payload - already validated and mapped request payload
 * @param {object} user - user making the request
 * @returns {Promise<object>} normalized result { success, data?, errors? }
 */
async function submitImportSale(payload, user) {
  if (!IMPORT_SALE_TOKEN) {
    throw new Error('IMPORTSALE_API_TOKEN is not configured');
  }

  try {
    logger.info(`importSale: submitting order for user ${user?._id || 'unknown'}`);
    console.log('ImportSale Request:', JSON.stringify(payload, null, 2));

    const response = await axios.post(IMPORT_SALE_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${IMPORT_SALE_TOKEN}`
      },
      timeout: 15000
    });

    console.log('ImportSale Response:', JSON.stringify(response.data, null, 2));

    const data = response.data;
    return {
      success: data?.success === true,
      data,
      status: response.status
    };
  } catch (error) {
    logger.error(`importSale API error: ${error.message}`, {
      status: error.response?.status,
      data: error.response?.data
    });

    return {
      success: false,
      status: error.response?.status || 500,
      error: error.response?.data || error.message
    };
  }
}

module.exports = {
  submitImportSale
};

