# 🚀 Quick Start - Coupon System & Deployment

## For The Impatient (TL;DR)

### 1️⃣ Test Coupon System Locally (2 mins)
```bash
# Restart server
cd server && npm run dev

# In new terminal, restart client
cd client && npm run dev

# Visit http://localhost:5173
# Add items to cart → Go to Checkout
# You'll see "Promo code" input in Order Summary
```

### 2️⃣ Create First Coupon (1 min)
```
1. Visit http://localhost:5173/admin/login
2. Login with your admin credentials
3. Click "Coupons" in sidebar
4. Click "New Coupon"
5. Fill: Code=WELCOME10, Type=Percentage, Value=10
6. Click "Create Coupon"
```

### 3️⃣ Test Applying Coupon (1 min)
```
1. Add items to cart (subtotal must be > ৳500 for WELCOME10)
2. Go to Checkout
3. In Order Summary, enter "WELCOME10"
4. Click "Apply"
5. See discount show in green! ✅
```

### 4️⃣ Deploy in 5 Minutes
```
A) Push code to GitHub:
   git add .
   git commit -m "Add coupon system"
   git push

B) Deploy to Railway (EASIEST):
   - Go to railway.app
   - Sign up with GitHub
   - Create new project
   - Select your GitHub repo
   - Set these environment variables:
     * MONGODB_URI: [your MongoDB Atlas URI]
     * NODE_ENV: production
     * CLIENT_URL: https://yourdomain.com
   - Done! Auto-deploys

C) Link Domain:
   - Buy domain from namecheap.com or godaddy.com (~$10/year)
   - In Railway, add domain
   - Update nameservers in domain registrar
   - Wait 24 hours
   - Visit https://yourdomain.com ✅
```

---

## 📝 Documentation

Read these in order:

1. **`COUPON_SYSTEM_GUIDE.md`**
   - How to create coupons
   - How customers use coupons
   - Example coupons
   - Troubleshooting

2. **`DEPLOYMENT_GUIDE.md`**
   - Step-by-step deployment
   - Domain setup
   - Environment variables
   - Hosting options (Railway, Heroku, AWS)

3. **`IMPLEMENTATION_SUMMARY.md`**
   - Technical details
   - What files were created/modified
   - Database schema
   - API endpoints

---

## 🎯 Most Common Tasks

### Admin: Create a Coupon
```
/admin/coupons → New Coupon → Fill form → Create Coupon
```

### Admin: Edit a Coupon
```
/admin/coupons → Click ✏️ Edit → Modify → Update
```

### Admin: Deactivate a Coupon
```
/admin/coupons → Click 👁️ Eye icon
```

### Customer: Apply Coupon
```
Checkout → Order Summary → Promo code field → Enter code → Apply
```

### Deploy Website
```
1. git push  (to GitHub)
2. railway.app create project
3. Add MongoDB URI to environment variables
4. Buy domain
5. Update nameservers
6. Done!
```

---

## ❓ FAQ

**Q: Where do I see the coupon code?**
A: At checkout, in the Order Summary sidebar (right side)

**Q: Can I create coupons for specific customers?**
A: Yes! Check "User-Specific Coupon" and select which users can use it

**Q: How do I deploy to a live domain?**
A: Read `DEPLOYMENT_GUIDE.md` → **Railway (Recommended)** section

**Q: What if I get MongoDB error?**
A: Make sure you set `MONGODB_URI` in your hosting provider's environment variables

**Q: How much does hosting cost?**
A: Railway has free tier (~$5/month after free credits), Heroku charges ~$7/month, domain costs ~$10/year

**Q: Can I use the site with just local JSON (no MongoDB)?**
A: Yes! It works fine with local JSON files. You only need MongoDB for production scale

**Q: How long does deployment take?**
A: Usually 2-5 minutes for code to deploy after pushing to GitHub

**Q: How long for domain to work after setup?**
A: Typically 24 hours (DNS propagation), sometimes as quick as 5 minutes

---

## 🔗 Useful Links

- **Railway Deployment**: https://railway.app
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Namecheap Domains**: https://www.namecheap.com
- **Check DNS Status**: https://whatsmydns.net
- **Project Code**: Read the implementation files in your workspace

---

## ⚡ Performance Tips

- Coupons are validated **server-side** (secure)
- Discount calculated **server-side** (can't be hacked)
- Usage count tracked for **each coupon** (analytics)
- Expired coupons **auto-rejected** (no admin action needed)
- Usage limits **automatically enforced** (no manual tracking)

---

## 🐛 If Something Breaks

1. Check `server/` logs in your terminal
2. Check `client/` browser console (F12)
3. Verify MongoDB connection string
4. Try restarting server: `npm run dev`
5. Clear browser cache: Ctrl+Shift+Delete
6. Read troubleshooting sections in guides

---

## 🎓 Next Steps (In Order)

- [ ] Test coupon system locally (2 mins)
- [ ] Create test coupons (5 mins)
- [ ] Verify checkout integration (5 mins)
- [ ] Read DEPLOYMENT_GUIDE.md (10 mins)
- [ ] Get MongoDB Atlas URI (5 mins)
- [ ] Buy a domain (2 mins)
- [ ] Deploy to Railway (5 mins)
- [ ] Link domain (2 mins)
- [ ] Test live website (5 mins)
- [ ] Create real promotions (10 mins)
- [ ] Monitor sales! 🚀

**Total time: ~50 minutes to go live!**

---

## 💾 What You Have Now

✅ Complete e-commerce website
✅ Product catalog with images
✅ Shopping cart
✅ Checkout with shipping options
✅ Payment tracking
✅ Admin panel for products & orders
✅ **NEW: Coupon system**
✅ **NEW: Deployment ready**

---

## 🎉 You're Ready!

Everything is implemented and tested. Just pick one of these paths:

**Path A: Test First** (Recommended)
```
1. Run npm run dev (both client and server)
2. Create test coupon at /admin/coupons
3. Test at checkout
4. Then deploy
```

**Path B: Deploy Immediately**
```
1. Push to GitHub
2. Go to railway.app
3. Connect repo
4. Set MongoDB URI
5. Done! (You can test after)
```

---

**Questions?**
- See `COUPON_SYSTEM_GUIDE.md` for coupon help
- See `DEPLOYMENT_GUIDE.md` for deployment help
- See `IMPLEMENTATION_SUMMARY.md` for technical details

**Let's go live! 🚀**
