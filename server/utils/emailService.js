const nodemailer = require('nodemailer');

/**
 * Email Service - Sends verification and password reset emails
 * Supports both Gmail (development) and custom SMTP (production)
 */

// Initialize transporter (configure based on environment)
const getTransporter = () => {
  // Try Mailgun first (preferred for production)
  if (process.env.EMAIL_SERVICE === 'mailgun' && process.env.MAILGUN_DOMAIN && process.env.MAILGUN_API_KEY) {
    console.log('📧 Using Mailgun for email service');
    return nodemailer.createTransport({
      host: 'smtp.mailgun.org',
      port: 587,
      secure: false, // false for port 587 (STARTTLS)
      auth: {
        user: `postmaster@${process.env.MAILGUN_DOMAIN}`,
        pass: process.env.MAILGUN_API_KEY,
      },
      connectionTimeout: 5000,
      socketTimeout: 5000,
    });
  }
  
  if (process.env.EMAIL_SERVICE === 'gmail') {
    // Gmail setup (for development)
    // Use explicit SMTP host/port to avoid relying on service name resolution.
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT, 10) || 465;
    const secure = port === 465;
    console.log('📧 Using Gmail for email service:', { host, port, secure, user: process.env.EMAIL_USER ? 'set' : 'unset' });
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use App Password, not regular password
      },
      connectionTimeout: 5000, // 5 second timeout for faster fallback
      socketTimeout: 5000,     // 5 second socket timeout
      tls: {
        // allow self-signed certs if env requires it
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
    });
  } else if (process.env.SMTP_HOST) {
    // Custom SMTP (for production)
    console.log('📧 Using custom SMTP for email service');
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else {
    console.warn('⚠️  No email service configured. Falling back to console logging.');
    return {
      sendMail: async (mailOptions) => {
        console.log('📧 Email would be sent to:', mailOptions.to);
        return { messageId: 'console-mock' };
      }
    };
  }
};

/**
 * Get the correct from email address based on service
 */
const getFromEmail = () => {
  if (process.env.EMAIL_SERVICE === 'mailgun' && process.env.MAILGUN_FROM) {
    return process.env.MAILGUN_FROM;
  }
  return process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@thugxlifestyle.com';
};

/**
 * Send email verification link to user
 * @param {string} email - User email
 * @param {string} verificationToken - Token for verification
 * @param {string} userName - User name
 */
const sendVerificationEmail = async (email, verificationToken, userName) => {
  try {
    const transporter = getTransporter();

    // Build verification link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    const mailOptions = {
      from: getFromEmail(),
      to: email,
      subject: 'Verify Your Email - Thugx Lifestyle',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; color: white; text-align: center;">
            <h1 style="margin: 0;">Welcome to Thugx Lifestyle! 🎉</h1>
          </div>
          
          <div style="border: 1px solid #ddd; padding: 30px; background: #f9f9f9;">
            <p>Hi <strong>${userName}</strong>,</p>
            
            <p>Thank you for registering with us! To complete your registration and secure your account, please verify your email address by clicking the button below.</p>
            
            <p>This verification link will expire in <strong>24 hours</strong>.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; font-size: 12px;">
              If the button above doesn't work, copy and paste this link in your browser:<br>
              <code style="background: #eee; padding: 5px; border-radius: 3px;">${verificationLink}</code>
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            
            <p style="color: #999; font-size: 12px;">
              <strong>Didn't create this account?</strong> If you received this email by mistake, you can safely delete it. Your account won't be active until you verify your email.
            </p>
          </div>
          
          <div style="background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;">
            <p>© 2026 Thugx Lifestyle. All rights reserved.</p>
            <p>Securing your experience with enterprise-grade security.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error.message);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send password reset link to user
 * @param {string} email - User email
 * @param {string} resetToken - Token for password reset
 * @param {string} userName - User name
 */
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const transporter = getTransporter();

    // Build reset link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const mailOptions = {
      from: getFromEmail(),
      to: email,
      subject: 'Reset Your Password - Thugx Lifestyle',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 8px 8px 0 0; color: white; text-align: center;">
            <h1 style="margin: 0;">Password Reset Request</h1>
          </div>
          
          <div style="border: 1px solid #ddd; padding: 30px; background: #f9f9f9;">
            <p>Hi <strong>${userName}</strong>,</p>
            
            <p>We received a request to reset the password for your Thugx Lifestyle account. If you didn't make this request, you can safely ignore this email.</p>
            
            <p><strong>⚠️ Security Notice:</strong> This link will expire in <strong>30 minutes</strong> for your protection.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 12px;">
              If the button above doesn't work, copy and paste this link in your browser:<br>
              <code style="background: #eee; padding: 5px; border-radius: 3px;">${resetLink}</code>
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 3px;">
              <p style="margin: 0; color: #856404;">
                <strong>🔒 Password Security Tips:</strong><br>
                • Use a strong combination of uppercase, lowercase, numbers, and symbols<br>
                • Never share your password with anyone<br>
                • Change password regularly for better security
              </p>
            </div>
            
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
              <strong>Didn't request this?</strong> Your account may be compromised. Please contact our support immediately if this wasn't you.
            </p>
          </div>
          
          <div style="background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;">
            <p>© 2026 Thugx Lifestyle. All rights reserved.</p>
            <p>Protecting your account with advanced security measures.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error.message);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send account confirmation email after password reset
 * @param {string} email - User email
 * @param {string} userName - User name
 */
const sendPasswordChangedEmail = async (email, userName) => {
  try {
    const transporter = getTransporter();

    const mailOptions = {
      from: getFromEmail(),
      to: email,
      subject: 'Your Password Has Been Changed - Thugx Lifestyle',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); padding: 30px; border-radius: 8px 8px 0 0; color: white; text-align: center;">
            <h1 style="margin: 0;">✅ Password Changed Successfully</h1>
          </div>
          
          <div style="border: 1px solid #ddd; padding: 30px; background: #f9f9f9;">
            <p>Hi <strong>${userName}</strong>,</p>
            
            <p>Your password has been successfully changed. Your account is now secured with the new password.</p>
            
            <p><strong>Next Steps:</strong> You can now log in with your new password.</p>
            
            <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; border-radius: 3px; margin: 20px 0;">
              <p style="margin: 0; color: #155724;">
                <strong>✓ Account Security Enhanced</strong><br>
                Your account is now protected with a new password.
              </p>
            </div>
            
            <p style="color: #999; font-size: 12px;">
              <strong>Didn't make this change?</strong> If someone else changed your password, please contact our support immediately.
            </p>
          </div>
          
          <div style="background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;">
            <p>© 2026 Thugx Lifestyle. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password changed confirmation email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password changed email:', error.message);
    throw new Error('Failed to send confirmation email');
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
};

// Send one-time numeric OTP to user (for reset or verification)
const sendOTPEmail = async (email, otp, purpose = 'reset', userName = '') => {
  try {
    const transporter = getTransporter();
    const minutes = process.env.OTP_EXPIRES_MINUTES || 10;
    const subject = purpose === 'registration' ? 'Your Verification Code' : 'Your Password Reset Code';
    const mailOptions = {
      from: getFromEmail(),
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:#667eea;padding:20px;border-radius:8px;color:#fff;text-align:center;">
            <h2 style="margin:0;">${subject}</h2>
          </div>
          <div style="border:1px solid #eee;padding:20px;background:#fafafa;margin-top:10px;border-radius:6px;">
            <p>Hi <strong>${userName || 'User'}</strong>,</p>
            <p>Your ${purpose === 'registration' ? 'verification' : 'password reset'} code is:</p>
            <p style="font-size:28px;font-weight:700;letter-spacing:4px;text-align:center;margin:16px 0;">${otp}</p>
            <p style="color:#666;font-size:13px;">This code will expire in ${minutes} minutes. If you did not request this, ignore this email.</p>
          </div>
          <div style="text-align:center;color:#999;font-size:12px;margin-top:12px;">© 2026 Thugx Lifestyle</div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.messageId);
    return true;
  } catch (err) {
    console.error('Error sending OTP email:', err.message);
    throw new Error('Failed to send OTP email');
  }
};

// export OTP sender
module.exports.sendOTPEmail = sendOTPEmail;
