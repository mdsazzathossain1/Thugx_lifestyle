# Coupon System - Quick Reference

## ✅ What's Implemented

Your website now has a **complete coupon system** with these features:

### Features
✅ **Percentage Discounts** - Apply % off (e.g., 20% off)
✅ **Fixed Amount Discounts** - Apply fixed amount (e.g., ৳500 off)
✅ **Min Order Amount** - Require minimum cart value to use
✅ **Max Discount Cap** - Limit maximum discount on percentage coupons
✅ **Usage Limits** - Set how many times a coupon can be used globally
✅ **User-Specific Coupons** - Create coupons for specific users only
✅ **Expiry Dates** - Automatically disable expired coupons
✅ **Active/Inactive Toggle** - Enable/disable coupons anytime
✅ **Usage Tracking** - Track how many times each coupon has been used
✅ **Admin Dashboard** - Manage all coupons with intuitive UI
✅ **Customer-Facing** - Beautiful coupon input in checkout

---

## 🎯 How to Use the Coupon System

### For Admin Users

#### Create a New Coupon
1. Log in to Admin Panel: `https://yourdomain.com/admin/login`
2. Click **Coupons** in sidebar
3. Click **New Coupon** button
4. Fill in the form:
   - **Code**: Enter coupon code (e.g., `SUMMER20`)
   - **Discount Type**: Choose "Percentage" or "Fixed Amount"
   - **Discount Value**: Enter the amount (e.g., `20` for 20%)
   - **Min Order Amount**: Set minimum purchase requirement (optional)
   - **Max Discount**: Limit discount amount for percentage coupons
   - **Usage Limit**: Set max number of uses (leave empty for unlimited)
   - **Expiry Date**: Set when coupon expires (optional)
   - **Description**: Add a description for customers
5. **Optional - User-Specific**:
   - Check "User-Specific Coupon"
   - Select which users can use this coupon
6. Toggle **Active** if you want it available immediately
7. Click **Create Coupon**

#### Edit a Coupon
1. Go to **Coupons** page
2. Click the **✏️ Edit** button on the coupon card
3. Modify fields and click **Update Coupon**

#### Deactivate/Activate a Coupon
1. Click the **👁️ Eye** icon to toggle active status
2. Inactive coupons won't be usable by customers

#### Delete a Coupon
1. Click the **🗑️ Trash** icon
2. Confirm deletion

#### View Usage Stats
- See "Uses: X / Y" on coupon card
- Shows how many times coupon has been used

---

### For Customers

#### Apply a Coupon at Checkout
1. Go through checkout normally
2. In **Order Summary** (right sidebar), you'll see **"Promo code"** field
3. Enter coupon code (e.g., `SUMMER20`)
4. Click **Apply** button
5. If valid:
   - Discount amount displays in green
   - Total price updates automatically
   - You see discount in order summary
6. If invalid:
   - Error message explains why (expired, min amount, etc.)
   - Try another code

#### Valid Error Messages
- ❌ "Invalid or expired coupon code" → Code doesn't exist or is inactive
- ❌ "This coupon has expired" → Expiry date has passed
- ❌ "Coupon usage limit has been reached" → Too many people used it
- ❌ "Minimum order amount of ৳X is required" → Your order total is too low
- ❌ "Please log in to use this coupon" → Coupon is user-specific, need to login
- ❌ "This coupon is not available for your account" → You're not in allowed users list

---

## 💾 Database Structure

### Coupon Model

```javascript
{
  _id: "abc123def456",
  code: "SUMMER20",                    // Unique coupon code
  description: "20% off summer sale",  // Display text
  discountType: "percentage",          // "percentage" or "fixed"
  discountValue: 20,                   // Amount or percentage
  minOrderAmount: 1000,                // Minimum order total (0 = none)
  maxDiscountAmount: 5000,             // Max discount when using %
  usageLimit: 100,                     // Total uses allowed (null = unlimited)
  usageCount: 34,                      // Current usage count
  userSpecific: false,                 // Is coupon for specific users only?
  allowedUsers: [],                    // User IDs who can use this
  isActive: true,                      // Is coupon currently active?
  expiresAt: "2026-12-31T23:59:59Z",  // Expiry date (null = never expires)
  createdAt: "2026-01-01T10:00:00Z",
  updatedAt: "2026-01-15T10:00:00Z"
}
```

---

## 🔌 API Endpoints

### Public Endpoints (Customers)

#### Validate Coupon
```
POST /api/coupons/validate

Body:
{
  "code": "SUMMER20",
  "orderAmount": 5000,      // Subtotal (product amount only)
  "userId": "user123"       // Optional, for user-specific coupons
}

Response:
{
  "valid": true,
  "code": "SUMMER20",
  "description": "20% off",
  "discountType": "percentage",
  "discountValue": 20,
  "discountAmount": 1000    // Calculated discount
}
```

### Protected Admin Endpoints

#### Get All Coupons
```
GET /api/admin/coupons
Requires: Admin Auth Token
```

#### Create Coupon
```
POST /api/admin/coupons
Requires: Admin Auth Token

Body: Entire coupon object
```

#### Update Coupon
```
PUT /api/admin/coupons/:id
Requires: Admin Auth Token

Body: Fields to update
```

#### Delete Coupon
```
DELETE /api/admin/coupons/:id
Requires: Admin Auth Token
```

#### Get Users List
```
GET /api/admin/users
Requires: Admin Auth Token

Response:
{
  "users": [
    { "_id": "123", "name": "John", "email": "john@..." },
    { "_id": "456", "name": "Jane", "email": "jane@..." }
  ]
}
```

---

## 📝 Example Coupons to Create

### 1. Welcome Discount - All Users
- **Code**: `WELCOME10`
- **Type**: Percentage
- **Value**: 10%
- **Min Order**: 500
- **Max Discount**: 2000
- **Usage Limit**: Unlimited
- **User-Specific**: No
- **Active**: Yes

### 2. VIP Customer Only
- **Code**: `VIP20`
- **Type**: Percentage
- **Value**: 20%
- **Min Order**: 0
- **Max Discount**: 5000
- **Usage Limit**: Unlimited
- **User-Specific**: Yes
- **Allowed Users**: Select your VIP customers
- **Active**: Yes

### 3. Weekend Flash Sale
- **Code**: `WEEKEND15`
- **Type**: Fixed Amount
- **Value**: 1500
- **Min Order**: 3000
- **Usage Limit**: 50
- **Expires**: Next Monday 12:00 AM
- **Active**: Yes

### 4. Referral Bonus
- **Code**: `REFER500`
- **Type**: Fixed Amount
- **Value**: 500
- **Min Order**: 2000
- **Usage Limit**: Unlimited
- **User-Specific**: No
- **Active**: Yes

---

## 🔍 Troubleshooting

### Coupon not appearing in checkout
- ✅ Make sure coupon is **Active** in admin panel
- ✅ Check coupon expiry date hasn't passed
- ✅ Verify usage limit hasn't been reached

### Coupon shows but can't apply
- ✅ Check if order amount meets minimum
- ✅ Verify you're logged in (if user-specific)
- ✅ Check coupon code spelling (should be uppercase)

### Coupon applies but doesn't deduct from total
- ✅ Refresh the page
- ✅ Check browser console for errors (F12)
- ✅ Verify MongoDB connection in server logs

### Usage count not incrementing
- ✅ Check server logs for errors
- ✅ Verify MongoDB is connected
- ✅ Try placing a test order

---

## 📊 Sample Admin Reports

To analyze coupon performance:

```javascript
// Get top 5 most used coupons
const coupons = await Coupon.find({})
  .sort({ usageCount: -1 })
  .limit(5);

// Get total discount given
const result = await Order.aggregate([
  { $group: { _id: null, totalDiscount: { $sum: '$couponDiscount' } } }
]);

// Get coupons expiring in 7 days
const upcoming = await Coupon.find({
  expiresAt: {
    $gte: new Date(),
    $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }
});
```

---

## 🎓 Best Practices

✅ **Do:**
- Create multiple coupon types (welcome, seasonal, VIP)
- Set usage limits to control costs
- Use expiry dates for time-limited promotions
- Track coupon performance
- Create user-specific coupons for loyalty rewards

❌ **Don't:**
- Create coupons with very high discounts without usage limits
- Forget to deactivate old expired coupons
- Use very short coupon codes (use at least 5-6 characters)
- Create duplicates of the same code

---

## 🚀 Advanced Features (Future)

These could be added in future versions:
- Email coupons to specific users
- Automatic coupon generation for referrals
- Coupon analytics dashboard
- A/B testing different discount amounts
- Stack multiple coupons per order
- Seasonal coupon templates

---

**Your coupon system is ready to use! Start creating promotions now.**
