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
    console.log('Email configuration:', {
      service: process.env.EMAIL_SERVICE,
      user: process.env.EMAIL_USER ? `${process.env.EMAIL_USER}` : 'undefined', // Show full email for debugging
      pass: process.env.EMAIL_PASS ? 'PROVIDED' : 'undefined' // Don't log password
    });

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
      }
    });

    // Define mail options
    const mailOptions = {
      from: `"FortiGateX" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    console.log('Attempting to send email to:', options.to);
    console.log('Email subject:', options.subject);
    console.log('Email content:', options.html);

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error('Email sending error details:', error);
    throw error;
  }
};

module.exports = sendEmail; 