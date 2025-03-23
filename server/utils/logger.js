const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const errorLogPath = path.join(logsDir, 'error.log');
const infoLogPath = path.join(logsDir, 'info.log');
const apiLogPath = path.join(logsDir, 'api.log');

/**
 * Formats a log message with timestamp
 * @param {string} level - Log level (INFO, ERROR, etc.)
 * @param {string} message - Log message
 * @returns {string} Formatted log message
 */
const formatLogMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}\n`;
};

/**
 * Writes a log message to a file
 * @param {string} filePath - Path to log file
 * @param {string} message - Log message
 */
const writeToLog = (filePath, message) => {
  try {
    fs.appendFileSync(filePath, message);
  } catch (error) {
    console.error(`Failed to write to log file ${filePath}: ${error.message}`);
  }
};

/**
 * Logger utility for consistent logging
 */
const logger = {
  /**
   * Logs informational messages
   * @param {string} message - Log message
   */
  info: (message) => {
    const formattedMessage = formatLogMessage('INFO', message);
    console.log(formattedMessage.trim());
    writeToLog(infoLogPath, formattedMessage);
  },

  /**
   * Logs error messages
   * @param {string} message - Error message
   */
  error: (message) => {
    const formattedMessage = formatLogMessage('ERROR', message);
    console.error(formattedMessage.trim());
    writeToLog(errorLogPath, formattedMessage);
  },

  /**
   * Logs API requests and responses
   * @param {string} message - API log message
   */
  api: (message) => {
    const formattedMessage = formatLogMessage('API', message);
    writeToLog(apiLogPath, formattedMessage);
  },

  /**
   * Logs user-specific actions
   * @param {string} userId - User ID
   * @param {string} action - Action performed
   * @param {Object} details - Additional details
   */
  userAction: (userId, action, details = {}) => {
    const userLogPath = path.join(logsDir, `user_${userId}.log`);
    const message = formatLogMessage('USER_ACTION', `${action} - ${JSON.stringify(details)}`);
    writeToLog(userLogPath, message);
    writeToLog(infoLogPath, message);
  }
};

module.exports = logger; 