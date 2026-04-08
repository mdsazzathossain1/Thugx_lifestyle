# 🚀 Complete Free/Cheap Deployment Guide - Thugx Lifestyle

## 📊 Architecture Overview

```
Your Domain (thugxlifestyle.com)
    │
    ├─→ Frontend (Vercel) - React/Vite
    │   └─ Served from: vercel.app + Custom Domain
    │
    └─→ Backend (Railway.app) - Express.js
        └─ API served from: railway.app + Custom Domain
```

---

## 💰 Cost Breakdown (FREE + $5/month)

| Service | Cost | Why This Option |
|---------|------|-----------------|
| **Vercel** (Frontend) | FREE | Best React/Vite hosting, unlimited free deployments |
| **Railway.app** (Backend) | $5/month | Free tier + best startup value, reliable, easy scaling |
| **Domain** | ~$9-12/year | Namecheap or GoDaddy (optional, initially can use free domains) |
| **Email** | FREE | Gmail SMTP (development) or Mailgun free tier |
| **Total/Month** | ~$0.50 | Extremely affordable startup option |

---

## 🎯 Pre-Deployment Checklist

- [ ] Git account (https://github.com) created and verified
- [ ] Vercel account (https://vercel.com/signup) - Sign in with GitHub
- [ ] Railway.app account (https://railway.app) - Sign in with GitHub  
- [ ] Gmail account with App Password generated (for email service)
- [ ] Project pushed to GitHub
- [ ] Production environment variables prepared
- [ ] Database: Using JSON file store (built-in, no setup needed)

---

## ✅ Step-by-Step Deployment

### **PHASE 1: Prepare GitHub Repository**

#### Step 1.1: Initialize Git & Connect to GitHub
```bash
# In project root directory
cd d:\project\Thugx_lifestyle

# Check git status
git status

# If not initialized:
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Thugx Lifestyle e-commerce platform"

# Add remote (use YOUR USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/Thugx_lifestyle.git

# Push to GitHub (main branch)
git branch -M main
git push -u origin main
```

**Expected**: Your code is now on GitHub (public or private)

---

### **PHASE 2: Deploy Frontend (Vercel) - Takes ~5 minutes**

#### Step 2.1: Connect Vercel to GitHub
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Paste: `https://github.com/YOUR_USERNAME/Thugx_lifestyle`
4. Click "Import"

#### Step 2.2: Configure Vercel Project
1. **Framework**: Select "Vite"
2. **Root Directory**: `./client`
3. **Build Command**: `npm run build`
4. **Install Command**: `npm install`
5. **Output Directory**: `dist`
6. **Environment Variables**: Add these
   ```
   VITE_API_URL=http://localhost:5000
   VITE_BACKEND_URL=http://localhost:5000
   ```
   (Update after backend is deployed)

#### Step 2.3: Deploy
1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Your frontend is live at: `https://thugx-lifestyle.vercel.app`

**✅ Milestone**: Frontend deployed!

---

### **PHASE 3: Deploy Backend (Railway.app) - Takes ~10 minutes**

#### Step 3.1: Create Railway Project
1. Go to https://railway.app/dashboard
2. Click "+ New Project"
3. Click "Deploy from GitHub repo"
4. Select your GitHub repo: `Thugx_lifestyle`
5. Click "Deploy"

#### Step 3.2: Configure Backend on Railway
1. **Root directory**: Set to `server`
2. **Add Variables**: Go to Variables tab, add:
   ```
   PORT=5000
   NODE_ENV=production
   
   # JWT Secrets (Generate random strings at: https://generate-random.org)
   JWT_SECRET=your-super-secure-random-string-min-32-chars
   JWT_ADMIN_SECRET=another-secure-random-string-min-32-chars
   
   # Frontend URLs (update with your actual domain)
   CLIENT_URL=https://thugx-lifestyle.vercel.app
   FRONTEND_URL=https://thugx-lifestyle.vercel.app
   
   # Email Configuration
   EMAIL_SERVICE=gmail
   EMAIL_USER=thugxlifestyle6@gmail.com
   EMAIL_PASSWORD=REMOVED_SEE_RAILWAY_VARS
   EMAIL_FROM=noreply@thugxlifestyle.com
   
   # Node Environment
   NODE_ENV=production
   ```

#### Step 3.3: Deploy
1. Railway auto-detects from `package.json` scripts
2. Server will deploy automatically
3. Your backend URL: `https://your-railway-url.railway.app`
4. Copy this URL for next step

**✅ Milestone**: Backend deployed!

---

### **PHASE 4: Connect Frontend to Backend**

#### Step 4.1: Update Vercel Environment Variables
1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Update (or add):
   ```
   VITE_API_URL=https://your-railway-url.railway.app
   VITE_BACKEND_URL=https://your-railway-url.railway.app
   ```

#### Step 4.2: Redeploy Frontend
1. Go to Deployments tab
2. Click "Redeploy" for latest main
3. Frontend now connects to live backend

**✅ Milestone**: Frontend & Backend Connected!

---

### **PHASE 5: Update GitHub & Backend for CORS**

#### Step 5.1: Update Backend CORS Settings
Edit `server/server.js` and update CORS:

```javascript
const getCorsOptions = () => {
  return {
    origin: [
      'https://thugx-lifestyle.vercel.app',
      'https://thugxlifestyle.com', // Add your custom domain later
      'http://localhost:5173' // Dev environment
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
};
```

#### Step 5.2: Upload Changes to GitHub
```bash
git add server/server.js
git commit -m "Update CORS for production deployment"
git push origin main
```

#### Step 5.3: Railway Auto-Redeploys
Railway automatically redeploys on git push. Wait ~3-5 minutes for update.

---

### **PHASE 6: Set Up Email Service**

#### Step 6.1: Gmail Setup (Already Configured!)
- Email: `thugxlifestyle6@gmail.com`
- App Password: `REMOVED_SEE_RAILWAY_VARS`
- ✅ Already set in Railway variables

#### Alternative: Use Mailgun (Free Tier)
```
1. Go to https://www.mailgun.com/free/
2. Sign up (free tier = 100 emails/day)
3. Get API key and domain
4. Update Railway variables:
   EMAIL_SERVICE=custom
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_USER=postmaster@sandbox-xxxxx.mailgun.org
   SMTP_PASSWORD=your-api-key
```

---

### **PHASE 7: Custom Domain Setup**

#### Step 7.1: Purchase Domain
1. Buy domain from **Namecheap** (~$9/year)
   - Go to https://www.namecheap.com
   - Search `thugxlifestyle.com`
   - Add to cart & checkout

#### Step 7.2: Configure Domain for Vercel (Frontend)
1. **Vercel Dashboard** → Your Project → Settings → Domains
2. Click "Add Domain"
3. Enter: `thugxlifestyle.com`
4. Copy the nameservers shown
5. Go to **Namecheap** → Domain List → Manage
6. Select "Namecheap BasicDNS"
7. Update nameservers to Vercel's nameservers
8. Wait 24-48 hours for DNS propagation

---

#### Step 7.3: Configure Domain for Railway (Backend)
You have 2 options:

**Option A: API Subdomain (Recommended)**
```
1. In Namecheap, add DNS record:
   - Type: CNAME
   - Name: api
   - Value: your-railway-app.railway.app
   
2. Result: api.thugxlifestyle.com → Railway backend
3. Update Vercel variables:
   VITE_API_URL=https://api.thugxlifestyle.com
   VITE_BACKEND_URL=https://api.thugxlifestyle.com
4. Redeploy frontend on Vercel
```

**Option B: Use Railway Custom Domain**
```
1. In Railway Dashboard → Project Settings → Domains
2. Add custom domain: api.thugxlifestyle.com
3. Follow Railway's DNS setup instructions
```

#### Step 7.4: Verify Custom Domain
```bash
# Test frontend
curl https://thugxlifestyle.com

# Test backend
curl https://api.thugxlifestyle.com/health

# Should return API response
```

---

## 📁 Required Environment Variables Summary

### **Backend (.env in production/Railway)**
```env
# Server
NODE_ENV=production
PORT=5000

# Security
JWT_SECRET=min-32-char-random-string
JWT_ADMIN_SECRET=another-32-char-string
JWT_EXPIRE=7d

# URLs
CLIENT_URL=https://thugxlifestyle.vercel.app
FRONTEND_URL=https://thugxlifestyle.vercel.app
ALLOWED_ORIGINS=https://thugxlifestyle.vercel.app,https://api.thugxlifestyle.com,https://thugxlifestyle.com

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=thugxlifestyle6@gmail.com
EMAIL_PASSWORD=REMOVED_SEE_RAILWAY_VARS
EMAIL_FROM=noreply@thugxlifestyle.com

# Optional: MongoDB (comment out if using JSON store)
# MONGODB_URI=your-mongo-connection-string
```

### **Frontend (.env in Vercel)**
```env
VITE_API_URL=https://api.thugxlifestyle.com
VITE_BACKEND_URL=https://api.thugxlifestyle.com
```

---

## 🔒 Security Checklist (IMPORTANT!)

- [ ] **Change JWT_SECRET**: Generate at https://generate-random.org (min 32 chars)
- [ ] **Change JWT_ADMIN_SECRET**: Same as above
- [ ] **Update admin password**: Default is in admins.json
  ```bash
  # In your app's admin dashboard, change default admin password
  EMAIL: admin@thugxlifestyle.com
  PASSWORD: Change me!
  ```
- [ ] **Email credentials**: Move to production email (Mailgun/SendGrid recommended)
- [ ] **CORS origins**: Only allow your domains
- [ ] **HTTPS**: All traffic now secured (auto by Vercel/Railway)
- [ ] **Database**: Ensure admins.json is NOT in git (.gitignore ✅)

---

## 🧪 Post-Deployment Testing

### Test 1: Frontend Loads
```bash
curl https://thugxlifestyle.com
# Should return HTML page
```

### Test 2: API Responds
```bash
curl https://api.thugxlifestyle.com
# Should return API response or 404 (fine, means server is up)
```

### Test 3: Login Works
1. Go to https://thugxlifestyle.com
2. Register new user
3. Check email for verification link
4. Verify email & login

### Test 4: Admin Panel
1. Go to https://thugxlifestyle.com/admin/login
2. Email: admin@thugxlifestyle.com
3. Password: (the one changed in security checklist)
4. Dashboard should load

---

## 📊 Monitoring & Logs

### **View Vercel Logs**
```
Vercel Dashboard → Your Project → Deployments → [Latest] → Logs
```

### **View Railway Logs**
```
Railway Dashboard → Your Project → Logs tab
```

### **View Backend Errors**
```
Railway → Logs → Search for errors
```

---

## 🐛 Troubleshooting

### **Problem**: Frontend can't connect to backend
**Solution**: 
- Check CORS settings in server/middleware/security.js
- Verify backend URL in Vercel variables
- Check Railway is deployed and running

### **Problem**: Email not sending
**Solution**:
- Verify EMAIL_PASSWORD is correct app password (not regular password)
- Check Gmail: Settings → Security → App passwords
- Try Mailgun free tier instead

### **Problem**: Login page shows 404
**Solution**:
- Frontend build might be cached
- Go to Vercel → Redeploy latest
- Clear browser cache (Ctrl+Shift+Delete)

### **Problem**: Database uploads lost
**Solution**:
- JSON files in `server/db/data/` are ephemeral on Railway
- Either:
  1. Use MongoDB free tier (Atlas)
  2. Set up persistent volume in Railway
  3. Migrate to managed database

---

## 💾 Database Persistence (MongoDB Free Tier)

If you need persistent database beyond Railway's ephemeral storage:

1. Create MongoDB Atlas free account: https://www.mongodb.com/cloud/atlas
2. Create free tier cluster
3. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/thugx-lifestyle`
4. Add to Railway variables:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/thugx-lifestyle
   ```
5. Server auto-detects and uses MongoDB

---

## 🎉 You're Live!

### Final URLs:
- **Frontend**: https://thugxlifestyle.com
- **Backend API**: https://api.thugxlifestyle.com
- **Admin Panel**: https://thugxlifestyle.com/admin

### Next Steps:
1. Monitor performance in Vercel/Railway dashboards
2. Set up email alerts for errors
3. Plan scaling when traffic grows
4. Add SSL certificate (auto-included ✅)

### Support & Resources:
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Express Deploy Guide**: https://expressjs.com/en/advanced/best-practice-performance.html

---

**Last Updated**: April 2026 | **Version**: 1.0
