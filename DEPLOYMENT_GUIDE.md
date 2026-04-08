# Thugx Lifestyle - Complete Deployment Guide

This guide will walk you through deploying your Thugx Lifestyle e-commerce website to a live hosting provider with a custom domain.

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Hosting Provider Setup](#hosting-provider-setup)
   - Option A: Railway (Recommended - Free Tier Available)
   - Option B: Heroku
   - Option C: AWS
3. [MongoDB Atlas Setup](#mongodb-atlas-setup)
4. [Domain Registration & Setup](#domain-registration--setup)
5. [Deployment Steps](#deployment-steps)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Troubleshooting](#troubleshooting)

---

## 📌 Pre-Deployment Checklist

Before deploying, ensure:

- ✅ All code is committed to git
- ✅ Environment variables are properly configured
- ✅ MongoDB Atlas connection string is ready
- ✅ You have a domain name (or purchase one)
- ✅ Client builds successfully: `npm run build` in `client/` folder
- ✅ Server has correct `PORT` environment variable

---

## 🚀 Hosting Provider Setup

### **Option A: Railway (RECOMMENDED)**

Railway is the easiest to set up, has a free tier, and is already pre-configured in your `server/railway.toml`.

#### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Authorize Railway to access your GitHub account

#### Step 2: Create a New Project
1. Click "New Project" → "Deploy from GitHub repo"
2. Select your GitHub repository
3. Railway will auto-detect it's a Node.js project

#### Step 3: Configure Environment Variables
1. Go to **Variables** tab in Railway dashboard
2. Add these environment variables:

```
NODE_ENV=production
PORT=5000
CLIENT_URL=https://yourdomain.com
MONGODB_URI=your_mongodb_atlas_connection_string
```

**Get MongoDB URI:**
- Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Go to your cluster → "Connect" → "Connect your application"
- Copy the connection string
- Replace `<password>` with your actual password
- Example: `mongodb+srv://user:password@cluster0.mongodb.net/thugx_lifestyle?retryWrites=true&w=majority`

#### Step 4: Deploy
1. Railway will auto-deploy when you push to GitHub
2. Once deployment is complete, you'll get a Railway URL (e.g., `https://thugx-production.railway.app`)
3. Copy this URL for domain setup

---

### **Option B: Heroku**

#### Step 1: Create Heroku Account
1. Go to [heroku.com](https://www.heroku.com)
2. Sign up
3. Download and install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

#### Step 2: Create App
```bash
heroku create your-app-name
```

#### Step 3: Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set CLIENT_URL=https://yourdomain.com
```

#### Step 4: Deploy from Git
```bash
git push heroku main
```

---

### **Option C: AWS (EC2)**

#### Step 1: Launch EC2 Instance
1. Go to [AWS Console](https://console.aws.amazon.com)
2. Create an EC2 instance (Ubuntu 20.04)
3. Allocate elastic IP address

#### Step 2: Connect via SSH
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### Step 3: Install Dependencies
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs git
sudo apt-get update && sudo apt-get upgrade -y
```

#### Step 4: Clone and Deploy
```bash
cd /home/ubuntu
git clone https://github.com/your-username/Thugx_lifestyle.git
cd Thugx_lifestyle/server
npm install

# Create .env file
nano .env
# Add:
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_uri
CLIENT_URL=https://yourdomain.com
```

#### Step 5: Use PM2 for Process Management
```bash
sudo npm install -g pm2
pm2 start server.js --name "thugx-server"
pm2 startup
pm2 save
```

---

## 🗄️ MongoDB Atlas Setup (if not already done)

#### Step 1: Create Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up (free)
3. Create new cluster → Select "M0 Sandbox" (free tier)

#### Step 2: Create Database User
1. Go to **Database Access**
2. Click "Add New Database User"
3. Username: `thugx_user`
4. Password: Generate secure password (save it!)
5. Database User Privilege: **Read and write to any database**

#### Step 3: Get Connection String
1. Go to **Clusters** → "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<username>`, `<password>`, and update database name to `thugx_lifestyle`

Example:
```
mongodb+srv://thugx_user:YOUR_PASSWORD@cluster0.mongodb.net/thugx_lifestyle?retryWrites=true&w=majority
```

#### Step 4: Allow Network Access
1. Go to **Network Access**
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (or your hosting provider's IP)

---

## 🌐 Domain Registration & Setup

### **Step 1: Purchase Domain**

Popular registrars:
- [Namecheap.com](https://www.namecheap.com)
- [GoDaddy.com](https://www.godaddy.com)
- [Domain.com](https://www.domain.com)

Estimated cost: **$8-$15/year**

### **Step 2: Link Domain to Hosting**

#### If using **Railway**:
1. In Railway dashboard, go to your project
2. Click on the main service
3. Go to **Settings** → **Domains**
4. Add custom domain: `yourdomain.com`
5. Railway will show you nameservers or CNAME record to add
6. Go to your domain registrar
7. Update **Nameservers** or **DNS Records** (CNAME)

#### If using **Heroku**:
1. Go to **Settings** → **Domains and certificates**
2. Add domain: `yourdomain.com`
3. Heroku will give you a CNAME target
4. Go to domain registrar
5. Create CNAME record:
   - Type: CNAME
   - Name: @
   - Value: [Heroku CNAME target]

#### If using **AWS EC2**:
1. Go to Route 53 (or your registrar's DNS management)
2. Create A record:
   - Type: A
   - Name: @ (or yourdomain.com)
   - Value: Your Elastic IP address
3. Wait for DNS to propagate (5-48 hours)

### **Step 3: SSL Certificate (HTTPS)**

- **Railway**: Automatically provides free SSL
- **Heroku**: Automatically provides free SSL
- **AWS EC2**: Use [Let's Encrypt](https://certbot.eff.org/) (free):
  ```bash
  sudo apt-get install certbot python3-certbot-nginx
  sudo certbot certonly --standalone -d yourdomain.com
  ```

---

## 📋 Deployment Steps

### Step 1: Build Client App
```bash
cd client
npm run build
```

### Step 2: Push to GitHub
```bash
git add .
git commit -m "Add coupon system and prepare for deployment"
git push origin main
```

### Step 3: Deploy via Your Provider

**Railway:**
- Automatic! Just push to GitHub. Railway auto-deploys.

**Heroku:**
```bash
heroku create your-app-name
git push heroku main
```

**AWS:**
- SSH into instance and pull latest code:
```bash
cd /home/ubuntu/Thugx_lifestyle
git pull origin main
cd server
npm install
pm2 restart thugx-server
```

### Step 4: Verify Deployment
1. Open `https://yourdomain.com` in browser
2. Check admin login: `https://yourdomain.com/admin/login`
3. Check backend health: `https://yourdomain.com/api/health`

---

## ✅ Post-Deployment Verification

### 1. Test Frontend
- [ ] Home page loads
- [ ] Products display
- [ ] Add to cart works
- [ ] Checkout form works
- [ ] Coupon code validation works

### 2. Test Backend
- [ ] API returns products: `GET /api/products`
- [ ] Settings load: `GET /api/settings`
- [ ] Coupon validation: `POST /api/coupons/validate`

### 3. Test Admin Panel
- [ ] Login works
- [ ] Can create a test coupon
- [ ] Can view orders
- [ ] Coupon appears in admin dashboard

### 4. Test Database Connection
- [ ] Orders save correctly
- [ ] Data persists after restart

---

## 🔧 Environment Variables

Create a `.env` file in `server/` with:

```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:password@cluster0.mongodb.net/thugx_lifestyle?retryWrites=true&w=majority

# Client URL (for CORS)
CLIENT_URL=https://yourdomain.com

# Admin credentials (optional - for seeding)
ADMIN_EMAIL=admin@thugxlifestyle.com
ADMIN_PASSWORD=your_secure_password
```

**NEVER commit `.env` to GitHub!** Add to `.gitignore`:
```
.env
.env.local
node_modules/
```

---

## 📊 Monitoring & Logs

### Railway Logs
```
Dashboard → Project → Logs tab
```

### Heroku Logs
```bash
heroku logs --tail
```

### AWS EC2 Logs
```bash
pm2 logs thugx-server
```

---

## 🚨 Troubleshooting

### "Cannot connect to MongoDB"
- [ ] Check MongoDB URI in `.env`
- [ ] Verify IP is whitelisted in MongoDB Atlas
- [ ] Check username/password is correct

### "CORS error - blocked by browser"
- [ ] Ensure `CLIENT_URL` environment variable is set to your domain
- [ ] Restart the server/redeploy

### "Port already in use"
- [ ] Change PORT in `.env` to different number
- [ ] Or kill existing process: `pm2 kill` then restart

### "Domain not connecting"
- [ ] Check DNS propagation: [whatsmydns.net](https://whatsmydns.net)
- [ ] Wait 24-48 hours for DNS to update
- [ ] Verify CNAME/A record in domain registrar

### "Database connection timeout"
- [ ] Check network whitelist in MongoDB Atlas
- [ ] Add `?authSource=admin` to MongoDB URI
- [ ] Restart database connection from Railway/Heroku dashboard

---

## 💡 Performance Tips

1. **Enable Redis Cache** (optional):
   ```bash
   npm install redis
   ```

2. **Set up CDN** for static assets (Cloudflare, AWS CloudFront)

3. **Enable compression**:
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

4. **Monitor database queries** with MongoDB Atlas Metrics

---

## 📞 Support

If you encounter issues:

1. Check logs in your hosting dashboard
2. Verify all environment variables are set
3. Test locally first: `npm run dev` in both `server/` and `client/`
4. Check MongoDB Atlas status
5. Verify domain DNS settings

---

**Good luck with your deployment! 🎉**

Once deployed, you can access:
- **Frontend**: `https://yourdomain.com`
- **Admin Panel**: `https://yourdomain.com/admin/login`
- **API**: `https://yourdomain.com/api`
