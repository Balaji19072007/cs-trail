// backend/utils/emailService.js
const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send OTP Email to User
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP
 * @param {string} firstName - User's first name
 * @returns {Promise}
 */
exports.sendOTPEmail = async (to, otp, firstName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"CS Studio" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Your OTP for CS Studio Registration',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                    color: white;
                }
                .content {
                    background: #f9f9f9;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }
                .otp-code {
                    background: #667eea;
                    color: white;
                    padding: 15px 30px;
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 5px;
                    text-align: center;
                    border-radius: 8px;
                    margin: 20px 0;
                    display: inline-block;
                }
                .expiry-note {
                    color: #e74c3c;
                    font-weight: bold;
                    background: #ffeaa7;
                    padding: 10px;
                    border-radius: 5px;
                    border-left: 4px solid #e74c3c;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    color: #666;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>CS Studio</h1>
                <p>Your Coding Journey Starts Here</p>
            </div>
            <div class="content">
                <h2>Hello ${firstName},</h2>
                <p>Thank you for choosing CS Studio! Use the OTP below to complete your registration:</p>
                
                <div class="otp-code">${otp}</div>
                
                <div class="expiry-note">
                    ⚠️ This OTP will expire in 2 minutes for security reasons.
                </div>
                
                <p>If you didn't request this OTP, please ignore this email.</p>
                
                <div class="footer">
                    <p>Best regards,<br>The CS Studio Team</p>
                    <p>Need help? Contact us at ${process.env.EMAIL_USER}</p>
                </div>
            </div>
        </body>
        </html>
      `,
      text: `
        Hello ${firstName},

        Thank you for choosing CS Studio! Use the OTP below to complete your registration:

        Your OTP: ${otp}

        ⚠️ This OTP will expire in 2 minutes for security reasons.

        If you didn't request this OTP, please ignore this email.

        Best regards,
        The CS Studio Team
        Need help? Contact us at ${process.env.EMAIL_USER}
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${to}`);
    return result;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error('Failed to send OTP email');
  }
};

/**
 * Test email configuration
 */
exports.testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
};