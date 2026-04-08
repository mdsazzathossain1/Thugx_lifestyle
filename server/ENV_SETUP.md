# Backend Environment Variables Guide

## Railway.app Environment Variables Setup

### How to Set Variables in Railway

1. Go to **Railway Dashboard** → Your Project
2. Click **Variables** tab
3. Add all variables listed below

---

## Production Variables for Railway

Copy these variables and paste them in Railway's Variables tab:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Frontend URLs (Update with your actual Vercel URL)
CLIENT_URL=https://thugx-lifestyle.vercel.app
FRONTEND_URL=https://thugx-lifestyle.vercel.app

# CORS - comma-separated list of allowed origins
ALLOWED_ORIGINS=https://thugx-lifestyle.vercel.app,https://api.thugxlifestyle.com,https://thugxlifestyle.com

# JWT Secrets - Generate random 32+ char strings (IMPORTANT!)
# Generate at: https://generate-random.org
# Or use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=[PASTE_32_CHAR_RANDOM_STRING]
JWT_ADMIN_SECRET=[PASTE_ANOTHER_32_CHAR_STRING]
JWT_EXPIRE=7d

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=thugxlifestyle6@gmail.com
EMAIL_PASSWORD=REMOVED_SEE_RAILWAY_VARS
EMAIL_FROM=noreply@thugxlifestyle.com

# Optional: MongoDB (if using persistent database)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/thugxlifestyle
```

---

## Step-by-Step Setup in Railway

1. **Open Railway Variables Tab**
   - Railway Dashboard → Your Project → Variables

2. **Add Variables One by One**
   - Click "New Variable"
   - Paste each key=value pair

3. **For JWT Secrets**
   - Run in terminal: 
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - Copy output and paste as JWT_SECRET
   - Repeat for JWT_ADMIN_SECRET

4. **Click "Save"**
   - Railway will redeploy automatically (~3-5 minutes)

---

## Testing Variables

After deployment, test the backend:

```bash
# Check if API responds
curl https://your-railway-url.railway.app/api/health

# Should return:
# {"status":"ok","timestamp":"2026-04-08T..."}
```

---

## Important Notes

### Security
- ❌ **DO NOT** commit .env to git
- ✅ Use Railway's Variables tab for all secrets
- ✅ Keep JWT_SECRET long (32+ characters)
- ✅ Change EMAIL_PASSWORD if sharing the project

### Email Configuration
**Option 1: Gmail (Current - Good for Startup)**
- Works out of the box
- Free but limited to 100 sends/day
- Already configured with thugxlifestyle6@gmail.com

**Option 2: Mailgun (Better for Production)**
- Free tier: 100 emails/day
- Setup:
  1. Go to https://www.mailgun.com/free/
  2. Create account
  3. Get SMTP credentials
  4. Update variables:
     ```
     EMAIL_SERVICE=custom
     SMTP_HOST=smtp.mailgun.org
     SMTP_PORT=587
     SMTP_USER=postmaster@sandbox-xxxxx.mailgun.org
     SMTP_PASSWORD=[your-api-key]
     EMAIL_FROM=noreply@thugxlifestyle.com
     ```

### Database
- **Default**: JSON file store (works, data lives on server)
- **Recommended**: MongoDB Atlas free tier for persistent storage

---

## Troubleshooting

**Issue**: /api/health returns 404
- **Solution**: Backend not deployed, check Railway Logs

**Issue**: Email not sending
- **Solution**: 
  - Verify EMAIL_PASSWORD is correct app password
  - Check Gmail: Security → App passwords
  - Try Mailgun instead

**Issue**: CORS errors in frontend
- **Solution**: 
  - Update CLIENT_URL/FRONTEND_URL with actual frontend URL
  - Add frontend URL to ALLOWED_ORIGINS
  - Restart server (Railway auto-redeploys)

---

## Monitoring

View logs in Railway:
- **Railway Dashboard** → Your Project → **Logs** tab
- Search for "error" to find issues
- Check recent deployments in **Deployments** tab
