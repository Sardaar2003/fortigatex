const nodemailer = require('nodemailer');

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content (optional)
 * @param {string} options.html - HTML content (optional)
 */
const sendEmail = async (options) => {
  try {
    if (process.env.ENABLE_EMAIL !== 'true') {
      return { success: false, message: 'Email sending is disabled' };
    }

    // Check for required environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email configuration is missing');
    }

    // Create transporter with more detailed configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false // Only for development/testing
      }
    });

    // Verify transporter configuration
    await transporter.verify();

    // Create email options
    const mailOptions = {
      from: `"FortiGateX" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    return { 
      success: true, 
      messageId: info.messageId,
      message: 'Email sent successfully'
    };
  } catch (error) {
    return { 
      success: false, 
      message: `Failed to send email: ${error.message}`,
      error: error
    };
  }
};

module.exports = sendEmail; 