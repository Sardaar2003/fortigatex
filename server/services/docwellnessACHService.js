const axios = require('axios');
const logger = require('../utils/logger');

const IMPORT_SALE_URL = 'https://api.boilfrog.com/oms/xml-proxy/importSale';
const DOCWELLNESS_ACH_TOKEN = process.env.IMPORTSALE_ACH_API_TOKEN;

/**
 * Call Boilfrog importSale endpoint for Docwellness ACH.
 * @param {object} payload - already validated and mapped request payload
 * @param {object} user - user making the request
 * @returns {Promise<object>} normalized result { success, data?, errors? }
 */
async function submitDocwellnessACH(payload, user) {
  if (!DOCWELLNESS_ACH_TOKEN) {
    throw new Error('IMPORTSALE_ACH_API_TOKEN is not configured');
  }

  try {
    logger.info(`docwellnessACH: submitting order for user ${user?._id || 'unknown'}`);
    console.log('DocwellnessACH Request:', JSON.stringify(payload, null, 2));

    const response = await axios.post(IMPORT_SALE_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DOCWELLNESS_ACH_TOKEN}`
      },
      timeout: 15000
    });

    console.log('DocwellnessACH Response:', JSON.stringify(response.data, null, 2));

    const data = response.data;
    return {
      success: data?.success === true,
      data,
      status: response.status
    };
  } catch (error) {
    console.log('DocwellnessACH Error Response:', JSON.stringify(error.response?.data || error.message, null, 2));
    logger.error(`docwellnessACH API error: ${error.message}`, {
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
  submitDocwellnessACH
};
