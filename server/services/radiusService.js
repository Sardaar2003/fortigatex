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
 * @param {string} xmlRequest - The XML request string
 * @param {Object} user - The user object
 * @returns {Promise<Object>} The validation result
 */
const checkCustomerEligibility = async (xmlRequest, user) => {
  try {
    console.log('Sending request to Radius API...');
    console.log('Request XML:', xmlRequest);

    // Call Radius API
    const response = await axios.post(RADIUS_API_ENDPOINT, xmlRequest, {
      headers: {
        'Content-Type': 'application/xml'
      }
    });

    console.log('Received response from Radius API');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);

    // Parse the XML response
    const xmlResponse = response.data;
    logger.info(`Radius API raw response for user ${user?._id || 'unknown'}: ${JSON.stringify(xmlResponse)}`);

    // Extract status and message from XML response
    let status, message;

    // Simple and direct XML parsing
    try {
      // Remove any whitespace and newlines
      const cleanXml = xmlResponse.replace(/\s+/g, ' ').trim();
      
      // Extract status and message using regex
      const statusMatch = cleanXml.match(/status="([^"]*)"/);
      const messageMatch = cleanXml.match(/message="([^"]*)"/);

      if (statusMatch && messageMatch) {
        status = statusMatch[1];
        message = messageMatch[1];
        console.log('Parsed status:', status);
        console.log('Parsed message:', message);
      } else {
        console.error('Could not parse status or message from XML:', cleanXml);
      }
    } catch (err) {
      console.error('Error parsing XML:', err);
      logger.error(`Error parsing XML response: ${err.message}`);
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
        status: 0,
        message: result.message || 'Error processing request',
        eligible: false,
        reason: result.message || 'Error processing request',
        rawResponse: result
      };
    } else if (result.status === 1) {
      if (result.message === 'true') {
        // Success case - customer is eligible
        return {
          status: 1,
          message: 'true',
          eligible: true,
          reason: null,
          rawResponse: result
        };
      } else {
        // Blocked case
        return {
          status: 1,
          message: result.message,
          eligible: false,
          reason: result.message,
          rawResponse: result
        };
      }
    }

    // Default to ineligible if response format is unexpected
    return {
      status: 0,
      message: 'Unknown response format from validation service',
      eligible: false,
      reason: 'Unknown response format from validation service',
      rawResponse: result
    };
  } catch (error) {
    // Log the error
    logger.error(`Radius API error for user ${user?._id || 'unknown'}: ${error.message}`);
    console.error('Error in Radius API call:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    // If we have a response with XML data, try to parse it
    if (error.response?.data) {
      try {
        const cleanXml = error.response.data.replace(/\s+/g, ' ').trim();
        const statusMatch = cleanXml.match(/status="([^"]*)"/);
        const messageMatch = cleanXml.match(/message="([^"]*)"/);

        if (statusMatch && messageMatch) {
          const status = parseInt(statusMatch[1], 10);
          const message = messageMatch[1];
          
          return {
            status: status,
            message: message,
            eligible: false,
            reason: message,
            rawResponse: {
              status: status,
              message: message
            }
          };
        }
      } catch (parseErr) {
        console.error('Error parsing error response:', parseErr);
      }
    }

    // Return error response with proper structure
    return {
      status: 0,
      message: error.response?.data || error.message,
      eligible: false,
      reason: `API service error: ${error.message}`,
      error: error.toString()
    };
  }
};

module.exports = {
  checkCustomerEligibility
}; 