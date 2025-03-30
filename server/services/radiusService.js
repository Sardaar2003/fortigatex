const axios = require('axios');
const logger = require('../utils/logger');
const { parseString } = require('xml2js');
const util = require('util');

// Convert xml2js parseString to Promise-based function
const parseXML = util.promisify(parseString);

// Radius API configuration
const RADIUS_API_ENDPOINT = 'https://radius-dev.com/xml';
const API_KEY = 'ec8139c1-b66f-49a0-a0cf-2f83647b20cb';

/**
 * Checks if a customer is eligible to place an order by calling the Radius API
 * @param {Object} customerData - The customer data to validate
 * @returns {Promise<Object>} The validation result
 */
const checkCustomerEligibility = async (customerData, user) => {
  try {
    const { lastName, address1, state, zipCode, creditCardNumber, sessionId } = customerData;

    // Extract BIN (first 10 digits of credit card, padded with zeros if needed)
    const bin = (creditCardNumber.substring(0, 10) + '0000000000').substring(0, 10);

    // Build XML request
    const xmlData = `
      <disposition session_id="${sessionId || Math.random().toString(36).substring(2, 15)}" dnis="00000">
        <field id="key" value="${API_KEY}" />
        <field id="name" value="${lastName}" />
        <field id="address" value="${address1}" />
        <field id="state" value="${state}" />
        <field id="zip" value="${zipCode}" />
        <field id="bin" value="${bin}" />
      </disposition>
    `;

    // Log the request (safely - without full credit card number)
    logger.info(`Radius API request for user ${user?._id || 'unknown'}: ${JSON.stringify({
      sessionId,
      name: lastName,
      address: address1,
      state,
      zip: zipCode,
      bin: bin.substring(0, 6) + '****'
    })}`);

    // Call Radius API
    const response = await axios.post(RADIUS_API_ENDPOINT, xmlData, {
      headers: {
        'Content-Type': 'application/xml'
      }
    });

    // Parse the XML response
    const xmlResponse = response.data;
    logger.info(`Radius API raw response for user ${user?._id || 'unknown'}: ${JSON.stringify(xmlResponse)}`);

    // Extract status and message from XML response
    let status, message;

    // Method 1: Using regex to extract attributes (fallback approach)
    if (typeof xmlResponse === 'string') {
      const statusMatch = xmlResponse.match(/status="([^"]*)"/);
      const messageMatch = xmlResponse.match(/message="([^"]*)"/);

      status = statusMatch ? statusMatch[1] : null;
      message = messageMatch ? messageMatch[1] : null;
    }

    // Method 2: If xml2js is available, use it for proper XML parsing
    try {
      // This will only work if xml2js is installed
      const parsedXml = await parseXML(xmlResponse);
      if (parsedXml && parsedXml.results) {
        const results = parsedXml.results;
        status = results.$.status;
        message = results.$.message;
      }
    } catch (xmlParseErr) {
      // If xml2js is not available or there's an error, fallback to regex results
      logger.info(`Using regex parsing fallback for XML: ${xmlParseErr.message}`);
    }

    // Create a structured result object
    const result = {
      status: status ? parseInt(status, 10) : 0,
      message: message || 'Unknown response'
    };

    // Log the structured response
    logger.info(`Radius API structured response for user ${user?._id || 'unknown'}: ${JSON.stringify(result)}`);

    // Handle different response types
    if (result.status === 0) {
      // Error case
      return {
        eligible: false,
        reason: result.message,
        rawResponse: result
      };
    } else if (result.status === 1) {
      if (result.message === 'true') {
        // Success case - customer is eligible
        return {
          eligible: true,
          reason: null,
          rawResponse: result
        };
      } else {
        // Blocked case
        return {
          eligible: false,
          reason: result.message,
          rawResponse: result
        };
      }
    }

    // Default to ineligible if response format is unexpected
    return {
      eligible: false,
      reason: 'Unknown response format from validation service',
      rawResponse: result
    };
  } catch (error) {
    // Log the error
    logger.error(`Radius API error for user ${user?._id || 'unknown'}: ${error.message}`);

    // Return error response
    return {
      eligible: false,
      reason: `API service error: ${error.message}`,
      error: error.toString()
    };
  }
};

module.exports = {
  checkCustomerEligibility
}; 