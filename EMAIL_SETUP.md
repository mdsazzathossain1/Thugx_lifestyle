# 📧 Email Configuration Quick Setup

**IMPORTANT:** Email configuration is required for registration, password reset, and email verification to work!

---

## 🚀 Quick Start (Gmail - Development)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Click **"2-Step Verification"**
3. Follow the prompts

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select **"Mail"** and **"Windows Computer"** (or your device)
3. Google generates a **16-character password**
4. Copy this password

### Step 3: Update `.env` File

**Location:** `/server/.env`

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx    # Paste the 16-char password (without spaces)
EMAIL_FROM=noreply@thugxlifestyle.com
FRONTEND_URL=http://localhost:5173
```

### Step 4: Test It
```bash
cd server
npm run dev

# In another terminal, test registration at
# http://localhost:5173/register
```

**You should receive verification email immediately!**

---

## 🏭 Production Setup (SendGrid - Recommended)

### Step 1: Create SendGrid Account
1. Go to https://sendgrid.com
2. Sign up for free account (12,500 emails/month)
3. Verify your email

### Step 2: Create API Key
1. In SendGrid dashboard, go to **Settings → API Keys**
2. Click **"Create API Key"**
3. Choose **Full Access**
4. Copy the generated key (starts with `SG.`)
5. **Save securely** - you won't see it again!

### Step 3: Verify Sender Email
SendGrid requires you to verify who emails are from:

1. Go to **Settings → Sender Authentication**
2. Click **"Verify a Sender"**
3. Fill in your business email (e.g., noreply@thugxlifestyle.com)
4. Click the verification link in the email

### Step 4: Update `.env`

**Location:** `/server/.env`

```env
EMAIL_SERVICE=custom
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx    # Your API key
EMAIL_FROM=noreply@thugxlifestyle.com      # Must be verified
FRONTEND_URL=https://yourdomain.com
```

### Step 5: Deploy and Test
```bash
# Test that emails work
npm run dev

# Register a test account
# Check your email for verification
```

---

## 🔧 Environment Variables Explained

### Gmail Configuration
```env
EMAIL_SERVICE=gmail                    # Use Gmail
EMAIL_USER=yourname@gmail.com          # Your Gmail address
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx     # 16-char app password
EMAIL_FROM=noreply@yourdomain.com      # What users see as sender
FRONTEND_URL=http://localhost:5173     # Where verification link points
```

### Custom SMTP Configuration
```env
EMAIL_SERVICE=custom                   # Use custom SMTP
SMTP_HOST=smtp.sendgrid.net           # Email provider's SMTP server
SMTP_PORT=587                          # Usually 587 (TLS) or 465 (SSL)
SMTP_USER=apikey                       # Often "apikey" for SendGrid
SMTP_PASSWORD=SG.xxxxx                 # API key or password
EMAIL_FROM=noreply@yourdomain.com      # Verified sender address
FRONTEND_URL=https://yourdomain.com    # Production domain
```

---

## 📋 Supported Email Services

| Service | Setup Time | Cost | Limits | Best For |
|---------|-----------|------|--------|----------|
| **Gmail** | 5 min | FREE | 500/day* | Dev/Testing |
| **SendGrid** | 15 min | FREE | 12,500/mo | Production |
| **Mailgun** | 15 min | FREE | 10,000/mo | Startups |
| **AWS SES** | 20 min | $0.10 | 62,000/day | High Volume |
| **Postmark** | 15 min | Paid | Unlimited | Transactional |

*Gmail limits are per-account, not organization

---

## 🔒 Security Best Practices

### DO ✅
- Use **App Passwords** for Gmail (not your actual password)
- Keep API keys **secret** - never commit to Git
- Use **separate sender address** from personal email
- **Verify sender** in production (avoid bounces)
- Store passwords in `.env` (never hardcoded)
- Rotate keys every **6 months**

### DON'T ❌
- Don't use personal Gmail password (use App Password)
- Don't commit `.env` to Git (add to `.gitignore`)
- Don't share API keys with others
- Don't use free tier in production
- Don't hardcode credentials in code
- Don't reuse keys across environments

---

## 🚨 Troubleshooting Email

### "Email sending failed: 401 Unauthorized"
**Cause:** Wrong credentials in `.env`

**Fix:**
1. For Gmail: Regenerate app password
2. For SendGrid: Verify API key is correct
3. Restart server: `npm run dev`

### "Email rejected: 550 Unknown user"
**Cause:** EMAIL_FROM address not verified in SendGrid

**Fix:**
1. Go to SendGrid Sender Authentication
2. Verify the email address
3. Wait 24 hours for verification
4. Try again

### "550 Requested action not taken"
**Cause:** Sending to spam trap or invalid email

**Fix:**
1. Use valid test email
2. Check email format is correct
3. Try sending to different email

### Emails Going to Spam
**Cause:** No SPF/DKIM records configured

**Fix (for production):**
1. Add SendGrid's SPF record to DNS:
   ```
   v=spf1 sendgrid.net ~all
   ```
2. Add SendGrid's DKIM records:
   - From SendGrid: Settings → Sender Authentication → DKIM
   - Copy DNS records provided
   - Add to your domain's DNS
3. Wait 24 hours for propagation

### "Token already used"
**Cause:** Verification token can only be used once

**Fix:**
1. Click "Resend Verification Email"
2. Use the new token

### "Token expired"
**Cause:** Verification link older than 24 hours

**Fix:**
1. Go to login page
2. See "Didn't get email? Resend verification"
3. Click to get new link

---

## 📨 Email Templates

Your system uses professional HTML templates for:

1. **Email Verification Email**
   - Welcome message
   - Verification button
   - Token expires in 24 hours
   - Resend option

2. **Password Reset Email**
   - Security notice
   - Reset button
   - Token expires in 30 minutes
   - Password tips

3. **Password Changed Confirmation**
   - Confirmation message
   - Security notice
   - Don't recognize it? Contact support

All templates are styled professionally with:
- Gradient headers
- Clear call-to-action buttons
- Security tips
- Support contact info
- Responsive design (works on mobile)

---

## 📊 Email Testing Checklist

Before deployment, test:

- [ ] Registration sends verification email
- [ ] Verification link works correctly
- [ ] Resend verification works
- [ ] Forgot password sends reset email
- [ ] Reset password link works
- [ ] Email doesn't go to spam
- [ ] Links are clickable and correct
- [ ] Template renders nicely on mobile
- [ ] Sender email is recognizable
- [ ] All buttons work

---

## 🔄 Local Testing Without Emails

For development without sending actual emails:

### Option 1: Use Console Logging
```javascript
// In emailService.js
const sendVerificationEmail = async (email, token, userName) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('VERIFICATION EMAIL:');
    console.log(`To: ${email}`);
    console.log(`Token: ${token}`);
    console.log(`Link: ${process.env.FRONTEND_URL}/verify-email?token=${token}&email=${email}`);
    return true;
  }
  // ... actual email sending
};
```

### Option 2: Use Mailtrap (Free)
1. Go to https://mailtrap.io
2. Sign up free
3. Create inbox
4. Get SMTP credentials
5. Add to `.env` as custom SMTP

---

## 💡 Production Readiness Checklist

Before going live:

- [ ] Email service account created and tested
- [ ] API key/password stored in `.env` (not Git)
- [ ] Sender email address verified
- [ ] SPF/DKIM records added to DNS
- [ ] Test emails working end-to-end
- [ ] Emails not going to spam
- [ ] Rate limiting configured
- [ ] Error logging set up
- [ ] Backup email service configured
- [ ] Support email address in footer

---

## 📞 Support

**Email Service Help:**
- Gmail: https://support.google.com
- SendGrid: https://support.sendgrid.com
- Mailgun: https://mailgun.com/support

**Your App Support:**
- Email: support@thugxlifestyle.com
- Docs: See SECURITY_GUIDE.md

---

**Last Updated:** March 27, 2026  
**Version:** 1.0.0

© 2026 Thugx Lifestyle. All rights reserved.
