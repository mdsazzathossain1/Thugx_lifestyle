# 🔐 Advanced Authentication & Security System

**Last Updated:** March 27, 2026  
**Status:** ✅ Production-Ready  
**Security Level:** Enterprise-Grade

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication Flow](#authentication-flow)
3. [Email Verification System](#email-verification-system)
4. [Password Reset System](#password-reset-system)
5. [Security Protocols](#security-protocols)
6. [Environment Configuration](#environment-configuration)
7. [API Endpoints Reference](#api-endpoints-reference)
8. [Security Best Practices](#security-best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Testing Guide](#testing-guide)

---

## Overview

Your Thugx Lifestyle e-commerce platform now includes a **production-grade authentication and security system** with:

✅ **Email Verification** - Confirm user email addresses  
✅ **Password Reset** - Secure token-based password recovery  
✅ **Rate Limiting** - Prevent brute force attacks  
✅ **Input Validation** - Sanitize and validate all inputs  
✅ **XSS Protection** - Prevent cross-site scripting attacks  
✅ **SQL Injection Prevention** - Protect against SQL injection  
✅ **CORS Configuration** - Restrict unauthorized access  
✅ **Security Headers** - Helmet.js protection  
✅ **Password Strength** - Enforce strong passwords  
✅ **Token Expiration** - Time-limited reset tokens  

---

## Authentication Flow

### User Registration Flow

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  1. User fills registration form                       │
│     (name, email, password, phone)                     │
│                                                         │
│  2. Frontend validates input with Zod schema:          │
│     • Name: 2-50 characters, letters only              │
│     • Email: Valid email format                        │
│     • Phone: Valid phone format                        │
│     • Password: 8+ chars, uppercase, number, special   │
│                                                         │
│  3. POST /api/auth/register (rate limited: 5/15 min)   │
│                                                         │
│  4. Backend validation:                                │
│     • Check if email already exists                    │
│     • Hash password with bcryptjs (10 rounds)          │
│     • Generate verification token (32-byte random)     │
│     • Set expiration: 24 hours                         │
│                                                         │
│  5. Save user to database with:                        │
│     • emailVerified: false                             │
│     • verificationToken: hashed token                  │
│     • verificationTokenExpires: timestamp              │
│                                                         │
│  6. Send verification email with token link            │
│                                                         │
│  7. User sees "Check Your Email" message               │
│                                                         │
│  8. User clicks link in email → /verify-email?token=.. │
│                                                         │
│  9. Token validated server-side:                       │
│     • Check if token matches (hashed comparison)       │
│     • Check if not expired                             │
│     • Check if email matches                           │
│                                                         │
│ 10. If valid: emailVerified = true, token cleared      │
│                                                         │
│ 11. User can now log in                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### User Login Flow

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│ 1. User submits email & password                    │
│    (rate limited: 5 attempts / 15 minutes)          │
│                                                      │
│ 2. Backend checks:                                  │
│    ✓ User exists                                    │
│    ✓ Email verified (NEW!)                          │
│    ✓ Password matches (bcryptjs)                    │
│                                                      │
│ 3. If email NOT verified:                           │
│    → Return 403 Forbidden                           │
│    → Message: "Please verify your email"            │
│    → Show email verification form                   │
│    → Option to resend verification email            │
│                                                      │
│ 4. If everything OK:                                │
│    → Generate JWT token (expires in 7 days)         │
│    → Return user info + token                       │
│    → Store token in localStorage/cookie             │
│    → Redirect to dashboard                          │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Email Verification System

### How It Works

**Backend Process:**

1. **Token Generation** (On Registration)
   ```javascript
   // Generate random 32-byte token
   const token = crypto.randomBytes(32).toString('hex');
   
   // Hash token for storage (SHA-256)
   const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
   
   // Save hashed token to database
   user.verificationToken = hashedToken;
   user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
   
   // Send UNHASHED token to user's email
   await sendVerificationEmail(user.email, token, user.name);
   ```

2. **Email Sending**
   - Uses Nodemailer (Gmail or Custom SMTP)
   - Professional HTML template
   - Includes verification link with token
   - Token expires in 24 hours
   - Check spam folder guidance

3. **Token Verification** (When User Clicks Link)
   ```javascript
   // User receives unhashed token
   const token = req.body.token;
   const email = req.body.email;
   
   // Hash it to compare with stored hash
   const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
   
   // Verify:
   // 1. Token matches
   // 2. Not expired
   // 3. Email matches
   
   if (hashedToken === user.verificationToken && 
       now < user.verificationTokenExpires) {
     user.emailVerified = true;
     user.verificationToken = null;
     user.verificationTokenExpires = null;
     await user.save();
   }
   ```

### API Endpoints

**1. Register (POST /api/auth/register)**
```
Rate Limited: 5 per 15 minutes per IP

Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!@",
  "phone": "+234 8012345678"
}

Response (201) - Success:
{
  "message": "Registration successful! Please verify your email",
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "emailVerified": false
}

Response (400) - Error:
{
  "message": "Email already registered" | "Password too weak" | etc
}
```

**2. Verify Email (POST /api/auth/verify-email)**
```
No Rate Limit (secure token required)

Request:
{
  "email": "john@example.com",
  "token": "token_from_email_link"
}

Response (200) - Success:
{
  "message": "Email verified successfully!",
  "_id": "user_id",
  "email": "john@example.com",
  "emailVerified": true
}

Response (400) - Error:
{
  "message": "Invalid or expired verification token"
}
```

**3. Resend Verification (POST /api/auth/resend-verification)**
```
Rate Limited: 5 per 15 minutes per IP

Request:
{
  "email": "john@example.com"
}

Response (200) - Success:
{
  "message": "Verification email sent!"
}

Response (404) - Not Found:
{
  "message": "User not found"
}
```

---

## Password Reset System

### How It Works

**Backend Process:**

1. **Reset Request** (Forgot Password)
   ```javascript
   const email = req.body.email;
   
   // Find user (don't reveal if exists for security)
   const user = await User.findOne({ email });
   
   if (user) {
     // Generate reset token
     const token = crypto.randomBytes(32).toString('hex');
     const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
     
     // Save for 30 minutes
     user.resetToken = hashedToken;
     user.resetTokenExpires = Date.now() + 30 * 60 * 1000;
     await user.save();
     
     // Send email with unhashed token and reset link
     await sendPasswordResetEmail(user.email, token, user.name);
   }
   
   // Always return success (privacy)
   return res.json({ message: "If email exists, reset link sent" });
   ```

2. **Reset Execution**
   ```javascript
   // User clicks link: /reset-password?token=xxx&email=xxx
   const { email, token, newPassword } = req.body;
   
   // Validate password strength first
   // Then find user and verify token
   const user = await User.findOne({ email });
   const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
   
   if (hashedToken === user.resetToken && now < user.resetTokenExpires) {
     // Hash new password
     const hashedPassword = await bcrypt.hash(newPassword, 10);
     
     // Update and clear reset token
     user.password = hashedPassword;
     user.resetToken = null;
     user.resetTokenExpires = null;
     await user.save();
     
     // Send confirmation email
     await sendPasswordChangedEmail(user.email, user.name);
   }
   ```

### API Endpoints

**1. Forgot Password (POST /api/auth/forgot-password)**
```
Rate Limited: 3 per 60 minutes per IP

Request:
{
  "email": "john@example.com"
}

Response (200) - Always Success (privacy):
{
  "message": "If an account exists, reset link will be sent"
}

Note: Never reveals if email exists
```

**2. Reset Password (POST /api/auth/reset-password)**
```
Rate Limited: 3 per 60 minutes per IP

Request:
{
  "email": "john@example.com",
  "token": "token_from_email",
  "newPassword": "NewSecurePass456!@"
}

Response (200) - Success:
{
  "message": "Password reset successful! Log in with new password"
}

Response (400) - Error:
{
  "message": "Invalid or expired reset token"
}
```

---

## Security Protocols

### 1. ✅ Rate Limiting

**Applied to:**
- Registration: 5 attempts per 15 minutes
- Login: 5 attempts per 15 minutes
- Forgot Password: 3 attempts per 60 minutes
- Password Reset: 3 attempts per 60 minutes
- General API: 100 requests per 15 minutes

**Protection Against:**
- Brute force attacks
- Credential stuffing
- Distributed attacks

### 2. ✅ Input Validation & Sanitization

**Email Validation:**
```javascript
- Must be valid email format
- Trimmed and lowercased
- Normalized (removes extra spaces)
```

**Password Validation:**
```javascript
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (@$!%*?&)
```

**Name Validation:**
```javascript
- Minimum 2 characters, maximum 50
- Only letters, spaces, hyphens, apostrophes
```

**XSS Protection:**
```javascript
- Blocks <script>, javascript:, onerror=, onclick=
- Returned as 400 Bad Request
```

**SQL Injection Prevention:**
```javascript
- Detects UNION, SELECT, INSERT, UPDATE, DELETE, DROP, CREATE, ALTER
- Blocks SQL comments (-- and /* */)
- Blocks statement terminators (;)
```

### 3. ✅ Password Security

**Hashing:**
```javascript
// Uses bcryptjs with 10 salt rounds
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

// Computational cost: ~100-200ms per hash
// Makes brute force attacks impractical
```

**Strength Requirements:**
- Minimum 8 characters
- Mix of character types
- Complexity scoring
- Real-time feedback on registration

### 4. ✅ Token Security

**Email Verification Token:**
```javascript
- 32-bit random token generated with crypto.randomBytes()
- Hashed with SHA-256 before storage
- Expires in 24 hours
- One-time use only
```

**Password Reset Token:**
```javascript
- 32-bit random token generated with crypto.randomBytes()
- Hashed with SHA-256 before storage
- Expires in 30 minutes (shorter for security)
- One-time use only
- Requires both token AND email match
```

**JWT Token:**
```javascript
- Signed with HS256 algorithm
- Secret key from environment variable
- Expires in 7 days
- Contains user ID
```

### 5. ✅ CORS Protection

**Allowed Origins:**
```javascript
- http://localhost:3000 (development)
- http://localhost:5173 (Vite development)
- http://127.0.0.1:5173 (Node.js tests)
- Your production domain (set in .env)
```

**Only These Methods Allowed:**
- GET, POST, PUT, DELETE, PATCH, OPTIONS

**Headers Allowed:**
- Content-Type
- Authorization

### 6. ✅ Security Headers (Helmet.js)

**Content Security Policy (CSP):**
```
- Prevents inline scripts
- Restricts script sources to self
- Controls image, font, and API sources
```

**HSTS (HTTP Strict Transport Security):**
```
- Max-Age: 1 year
- Forces HTTPS connections
- Applies to subdomains
- Preloads in browsers
```

**Frame Guard:**
```
- X-Frame-Options: DENY
- Prevents clickjacking
```

**MIME Type Sniffing Protection:**
```
- X-Content-Type-Options: nosniff
- Prevents MIME type guessing
```

**XSS Protection (Old Browsers):**
```
- X-XSS-Protection: 1; mode=block
```

**Referrer Policy:**
```
- Strict-Origin-When-Cross-Origin
- Only sends origin in cross-origin requests
```

**Feature Policy:**
```
- Geolocation: disabled
- Microphone: disabled
- Camera: disabled
```

---

## Environment Configuration

### Required Environment Variables

Create a `.env` file in `/server` directory:

```env
# ─── SERVER ──────────────────────────────────────
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-domain.com

# ─── JWT ──────────────────────────────────────
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRE=7d

# ─── EMAIL (Choose ONE: gmail OR custom SMTP) ─────
EMAIL_SERVICE=gmail

# Gmail (Development)
EMAIL_USER=yourname@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@thugxlifestyle.com

# Custom SMTP (Production - Recommended)
# SMTP_HOST=smtp.sendgrid.net
# SMTP_PORT=587
# SMTP_USER=apikey
# SMTP_PASSWORD=SG.xxxxx

# ─── DATABASE ──────────────────────────────────
# Optional MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# ─── SECURITY ──────────────────────────────────
ALLOWED_ORIGINS=https://your-domain.com,https://dashboard.your-domain.com
```

### Email Service Setup

#### **Option 1: Gmail (Easy - Development)**

1. Enable 2-Factor Authentication on your Gmail account
2. Go to: https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer" (or your OS)
4. Google will generate a 16-character app password
5. Copy this password to `EMAIL_PASSWORD` in `.env`

**Advantages:**
- No setup required
- Works immediately
- Good for testing

**Disadvantages:**
- Low daily limits
- May be blocked in production
- Not suitable for high volume

#### **Option 2: SendGrid (Recommended - Production)**

1. Sign up at https://sendgrid.com
2. Create API key
3. Verify sender email
4. Add to `.env`:

```env
EMAIL_SERVICE=custom
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.your_api_key_here
```

#### **Option 3: AWS SES**

```env
EMAIL_SERVICE=custom
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
```

#### **Option 4: Mailgun**

```env
EMAIL_SERVICE=custom
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-password
```

---

## API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint | Auth | Rate Limit | Purpose |
|--------|----------|------|-----------|---------|
| POST | `/api/auth/register` | ❌ | 5/15m | Create new account |
| POST | `/api/auth/login` | ❌ | 5/15m | Sign in |
| POST | `/api/auth/verify-email` | ❌ | - | Verify email token |
| POST | `/api/auth/resend-verification` | ❌ | 5/15m | Resend verification |
| POST | `/api/auth/forgot-password` | ❌ | 3/60m | Request password reset |
| POST | `/api/auth/reset-password` | ❌ | 3/60m | Reset password |
| GET | `/api/auth/me` | ✅ | - | Get current user |
| PUT | `/api/auth/profile` | ✅ | - | Update profile |

### Request/Response Examples

**POST /api/auth/login with Unverified Email**

```
Request:
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!@"
}

Response: 403 Forbidden
{
  "message": "Please verify your email before logging in",
  "requiresVerification": true,
  "email": "user@example.com"
}

Frontend should:
1. Detect 403 status + requiresVerification flag
2. Show email verification UI
3. Offer to resend verification email
```

---

## Security Best Practices

### For Developers

1. **Always Use HTTPS in Production**
   ```
   Update your domain SSL in production
   Use HSTS headers (already configured)
   Redirect all HTTP to HTTPS
   ```

2. **Rotate Secrets Regularly**
   ```
   Change JWT_SECRET every 6 months
   Change DB passwords annually
   Rotate email API keys when needed
   ```

3. **Monitor Failed Logins**
   ```javascript
   // Log suspicious activity
   console.log({
     type: 'login_failed',
     email: user.email,
     ip: req.ip,
     timestamp: new Date()
   });
   ```

4. **Update Dependencies**
   ```bash
   npm outdated              # Check outdated packages
   npm update                # Update to latest versions
   npm audit fix             # Fix security vulnerabilities
   ```

5. **Use Environment Variables**
   ```javascript
   // ✅ Good
   const secret = process.env.JWT_SECRET;
   
   // ❌ Bad
   const secret = "hardcoded-secret";
   ```

### For Users

1. **Strong Passwords**
   - 8+ characters
   - Mix of uppercase, lowercase, numbers, special chars
   - Unique passwords for each site
   - Never share passwords

2. **Email Safety**
   - Use a secure, personal email account
   - Enable 2FA on your email if possible
   - Check sender address carefully

3. **Link Verification**
   - Hover over links to see actual URL
   - Links should be from `your-domain.com`
   - Never click links from unsolicited emails

4. **Device Security**
   - Log out on shared computers
   - Use updated browsers and OS
   - Install antivirus software
   - Avoid public WiFi for sensitive actions

---

## Troubleshooting

### "Invalid or expired verification token"

**Causes:**
- Token expired (24 hours)
- Wrong email used
- Link clicked multiple times
- Browser cache issue

**Solutions:**
1. Click "Resend Verification Email"
2. Check spam/junk folder
3. Use incognito/private browsing
4. Try with exact email from registration

### "Email sending failed"

**Causes:**
- Missing EMAIL_PASSWORD in .env
- Gmail 2FA not set up correctly
- SendGrid API key wrong
- Email limit exceeded

**Solutions:**
1. Check .env file has EMAIL_PASSWORD
2. For Gmail: regenerate app password
3. For SendGrid: verify API key in dashboard
4. Check service rate limits

### "Passwords do not match"

**Causes:**
- Typed correctly but showed error
- Caps Lock enabled
- Passwords are actually different

**Solutions:**
1. Click "Show Password" to verify
2. Copy/paste verification email token carefully
3. Try again with fresh password

### "Too many login attempts"

**Causes:**
- Exceeded rate limit (5 per 15 minutes)
- Multiple failed login attempts
- Automated attacks

**Solutions:**
1. Wait 15 minutes for rate limit to reset
2. Use forgot password if you forgot password
3. Contact support if account locked

### Tests Not Working Locally

**Ensure:**
1. `.env` file has EMAIL_SERVICE=gmail or custom SMTP
2. Email credentials are correct
3. Database is running/configured
4. Frontend and backend both running

**Debug:**
```bash
# Check server logs
tail -f server.log

# Test email service
npm run test:email

# Verify environment
node -e "console.log(process.env.EMAIL_SERVICE)"
```

---

## Testing Guide

### Manual Testing Checklist

#### Registration Flow
- [ ] Navigate to /register
- [ ] Fill in all fields
- [ ] See "Check Your Email" message
- [ ] Receive verification email
- [ ] Click link in email
- [ ] See "Email verified" confirmation
- [ ] Can now log in

#### Forgot Password Flow
- [ ] Navigate to /forgot-password
- [ ] Enter registered email
- [ ] Receive reset email
- [ ] Click reset link
- [ ] Enter new password
- [ ] Confirm password matches
- [ ] See success message
- [ ] Can log in with new password

#### Security Tests
- [ ] Try SQL injection in email field: `admin' OR '1'='1`
  - Expected: "Invalid input detected"
- [ ] Try XSS in name: `<script>alert('xss')</script>`
  - Expected: "Invalid input detected"
- [ ] Try weak password: `pass123`
  - Expected: Error about special character
- [ ] Try 6 logins in 15 minutes
  - Expected: Rate limit error on 6th

#### Email Tests
- [ ] Check verification email is formatted nicely
- [ ] Verify token in URL is correct
- [ ] Test resend verification multiple times
- [ ] Verify old tokens don't work

---

## Security Checklist for Deployment

Before going live, verify:

- [ ] All environment variables configured in production
- [ ] FRONTEND_URL points to your actual domain
- [ ] ALLOWED_ORIGINS includes your domain
- [ ] Email service credentials are correct
- [ ] JWT_SECRET is long and random (32+ chars)
- [ ] SSL certificate installed (HTTPS only)
- [ ] HSTS headers enabled
- [ ] Backup of database in place
- [ ] Monitoring/alerting set up
- [ ] Rate limits appropriate for your traffic
- [ ] Logs being collected for audit
- [ ] Demo/test accounts deleted
- [ ] Payment processing (if any) tested
- [ ] 2FA optional on admin accounts
- [ ] Password reset emails tested
- [ ] Firewall configured

---

## Support & Security Contact

**Report Security Issues:**
- Email: security@thugxlifestyle.com
- Do not post security bugs publicly
- Allow 48 hours for response

**Technical Support:**
- Email: support@thugxlifestyle.com
- Response time: 24-48 hours

---

## Changelog

**Version 1.0.0** (March 27, 2026)
- Initial release
- Email verification system
- Password reset system
- Rate limiting
- Security headers
- Input validation

---

**Last Updated:** March 27, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production-Ready  

© 2026 Thugx Lifestyle. All rights reserved.
