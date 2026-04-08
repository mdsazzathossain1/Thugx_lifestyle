# System Architecture & Coupon Flow

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CUSTOMERS & ADMINS                       │
│  (Browser - React Frontend)                                      │
│  - Customer: Home, Shop, Cart, Checkout, Orders, Account        │
│  - Admin: Dashboard, Products, Orders, Coupons, Settings        │
└──────────────────────────────┬──────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │ HTTPS/REST API Calls  │
                    └───────────┬───────────┘
                                │
    ┌───────────────────────────┼───────────────────────────┐
    │                           │                           │
    ▼                           ▼                           ▼
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│  Express    │◄────────┤   Database   │────────►│   File       │
│  Server     │         │  (MongoDB    │         │   Storage    │
│  (Node.js)  │         │   or JSON)   │         │  (AWS S3)    │
│             │         │              │         │              │
│  Routes:    │         ├────────────┤         └──────────────┘
│  - /auth    │         │ Collections:│
│  - /products│├────────┤ - users     │
│  - /orders  │         │ - products  │
│  - /coupons │         │ - orders    │◄────── NEW
│  - /admin   │         │ - coupons   │◄────── NEW
└─────────────┘         │ - settings  │
                        └──────────────┘
```

---

## 🎫 Coupon Feature Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                       ADMIN PANEL                             │
│                   /admin/coupons                              │
│                                                               │
│  [New Coupon] [Edit] [Delete] [Toggle Active]               │
│                                                               │
│  Coupon Form:                                                │
│  - Code (required)                                           │
│  - Discount Type (% or ৳)                                    │
│  - Discount Value                                            │
│  - Min Order Amount                                          │
│  - Max Discount (for %)                                      │
│  - Usage Limit                                               │
│  - Expiry Date                                               │
│  - Description                                               │
│  - User-Specific (with user selector)                        │
│  - Active/Inactive                                           │
└────────────────────┬─────────────────────────────────────────┘
                     │ POST /api/admin/coupons
                     │ PUT /api/admin/coupons/:id
                     │ DELETE /api/admin/coupons/:id
                     │ GET /api/admin/coupons
                     │
                     ▼
            ┌────────────────────┐
            │   SERVER LOGIC     │
            │  couponController  │
            │                    │
            │ createCoupon()     │◄────┐
            │ updateCoupon()     │     │ Admin Auth
            │ deleteCoupon()     │     │ Required
            │ getAdminCoupons()  │◄────┤
            │ validateCoupon()   │     │ (Public)
            │ getUsersList()     │◄────┘
            └────────────┬───────┘
                         │
                         ▼
        ┌────────────────────────────┐
        │   COUPONS DATABASE FILE    │
        │  /server/db/data/          │
        │      coupons.json          │
        │                            │
        │ {                          │
        │   code: "SUMMER20"         │
        │   discountType: "%"        │
        │   discountValue: 20        │
        │   minOrderAmount: 1000     │
        │   maxDiscountAmount: 5000  │
        │   usageLimit: 100          │
        │   usageCount: 34           │
        │   userSpecific: false      │
        │   allowedUsers: []         │
        │   isActive: true           │
        │   expiresAt: "2026-12-31"  │
        │ }                          │
        │                            │
        └────────────────────────────┘
```

---

## 🛒 Customer Checkout Flow with Coupons

```
START: Customer Adds Items to Cart
├─ Item 1: ৳2,000 × 2 = ৳4,000
├─ Item 2: ৳1,500 × 1 = ৳1,500
├─ Subtotal: ৳5,500
└─ localStorage: thugx_cart = [...]

                    ▼

STEP 1: Go to Checkout Page
├─ Load /checkout
├─ GET /api/settings (get delivery charges)
├─ Display form: Name, Phone, Address, etc.
└─ Display Order Summary with items

                    ▼

STEP 2: Select Delivery & Payment Options
├─ Delivery: Inside Dhaka (৳60) or Outside (৳120)
├─ Payment: Full Payment or COD
└─ Calculate totals (without coupon yet)

                    ▼

STEP 3: (NEW) Apply Coupon [OPTIONAL]
├─ Customer enters: "SUMMER20"
├─ Click "Apply" button
│
└─ [Async] POST /api/coupons/validate
   {
     code: "SUMMER20",
     orderAmount: 5500,      (subtotal)
     userId: "user123"       (if logged in)
   }
   
   SERVER VALIDATION:
   ├─ Code exists?
   ├─ Is active?
   ├─ Expired?
   ├─ Usage limit reached?
   ├─ Meets min order amount?
   ├─ User allowed (if user-specific)?
   └─ Calculate discount amount
   
   RESPONSE:
   {
     valid: true,
     code: "SUMMER20",
     discountAmount: 1000,   (20% of 5500)
   }
   
   CLIENT:
   ├─ Show discount in green: "-৳1000"
   ├─ Update total: 5500 + 60 - 1000 = ৳4560
   └─ Save coupon code for order submission

                    ▼

STEP 4: Fill Shipping Details & Submit
├─ Full Name: "John Doe"
├─ Phone: "01712345678"
├─ Address: "Dhaka..."
└─ Click "Place Order"

   (Async) POST /api/orders
   {
     customer: {...},
     items: [...],
     deliveryType: "inside_dhaka",
     paymentType: "full",
     couponCode: "SUMMER20"  ◄─── NEW: Coupon included
   }

                    ▼

STEP 5: Server Processing
├─ Validate all items exist & have stock
├─ Deduct stock for each item
├─ Calculate subtotal: ৳5,500
├─ Add delivery: ৳60
├─ (NEW) Look up coupon & calculate discount: ৳1,000
├─ (NEW) Increment coupon usage count: 34 → 35
├─ Final total: ৳4,560
│
└─ Create Order:
   {
     orderNumber: "TXL-20260115-7342",
     items: [...],
     productSubtotal: 5500,
     deliveryCharge: 60,
     couponCode: "SUMMER20",      ◄─── NEW
     couponDiscount: 1000,        ◄─── NEW
     totalAmount: 4560,
     status: "pending"
   }

                    ▼

STEP 6: Confirmation
├─ Clear cart (localStorage)
├─ Redirect to: /order/TXL-20260115-7342/payment
├─ Show payment instructions
└─ Customer pays ৳4,560 (not ৳4,620)

                    ▼

END: Order Saved with Coupon Details
├─ Admin can see coupon applied
├─ Coupon usage count incremented
├─ Customer sees discount on receipt
└─ Coupon stats updated
```

---

## 🔄 Coupon Validation Logic (Server-Side)

```javascript
validateCoupon(code, orderAmount, userId):
  ├─ 1. Find coupon by code (case-insensitive)
  │   └─ If not found → "Invalid or expired coupon code"
  │
  ├─ 2. Check if active
  │   └─ If inactive → "Invalid or expired coupon code"
  │
  ├─ 3. Check expiry date
  │   └─ If expired → "This coupon has expired"
  │
  ├─ 4. Check usage limit
  │   └─ If reached → "Coupon usage limit has been reached"
  │
  ├─ 5. Check minimum order amount
  │   └─ If not met → "Minimum order amount ৳X required"
  │
  ├─ 6. Check if user-specific
  │   ├─ If user-specific & not logged in
  │   │  └─ "Please log in to use this coupon"
  │   └─ If not in allowedUsers list
  │      └─ "This coupon is not available for your account"
  │
  └─ 7. Calculate discount
      ├─ If percentage:
      │  ├─ discount = (orderAmount × value) / 100
      │  └─ if maxDiscount: discount = min(discount, maxDiscount)
      └─ If fixed:
         └─ discount = min(value, orderAmount)
         
      Return: { valid: true, discountAmount: X }
```

---

## 📊 Database Schema

### coupons.json
```javascript
[
  {
    _id: "abc123",
    code: "SUMMER20",
    description: "20% summer discount",
    discountType: "percentage",         // or "fixed"
    discountValue: 20,                  // 20% or ৳ amount
    minOrderAmount: 1000,               // Minimum order total (0 = none)
    maxDiscountAmount: 5000,            // Only for percentage type
    usageLimit: 100,                    // null = unlimited
    usageCount: 45,                     // How many times used
    userSpecific: false,                // Restricted to users?
    allowedUsers: ["user1", "user2"],   // If user-specific
    isActive: true,                     // Can be used?
    expiresAt: "2026-12-31T23:59:59Z", // null = never expires
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z"
  }
]
```

### orders.json (Updated)
```javascript
[
  {
    _id: "order123",
    orderNumber: "TXL-20260115-7342",
    customer: {...},
    items: [...],
    productSubtotal: 5500,
    deliveryCharge: 60,
    couponCode: "SUMMER20",      // ◄─── NEW
    couponDiscount: 1000,        // ◄─── NEW
    totalAmount: 4560,           // After coupon
    paymentAmount: 4560,
    status: "pending",
    // ... rest
  }
]
```

---

## 🔌 API Flow Diagram

```
CUSTOMER REQUESTS:

1. GET /api/settings
   └─ Returns: delivery charges, categories, etc.

2. POST /api/coupons/validate
   ├─ Request: { code, orderAmount, userId }
   └─ Response: { valid, discountAmount, ... }

3. POST /api/orders
   ├─ Request: { customer, items, deliveryType, paymentType, couponCode }
   └─ Response: { orderNumber, totalAmount, ... }

ADMIN REQUESTS (Protected):

1. GET /api/admin/coupons
   └─ Response: [ { coupon objects } ]

2. POST /api/admin/coupons
   ├─ Request: { code, discountType, discountValue, ... }
   └─ Response: { coupon object }

3. PUT /api/admin/coupons/:id
   ├─ Request: { fields to update }
   └─ Response: { updated coupon object }

4. DELETE /api/admin/coupons/:id
   └─ Response: { message: "Coupon deleted" }

5. GET /api/admin/users
   └─ Response: [ { _id, name, email, phone } ]
```

---

## 🔐 Security Layers

```
┌─────────────────────────────────────────────────┐
│ LAYER 1: HTTPS/TLS (Transport)                  │
│ All requests encrypted over HTTPS               │
└─────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│ LAYER 2: Authentication                         │
│ - Customers: JWT token in localStorage          │
│ - Admins: Separate JWT token for admin routes   │
│ - Public endpoints: No auth required             │
└─────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│ LAYER 3: Authorization                          │
│ - Admin routes: requireAdminAuth() middleware    │
│ - Public coupon endpoint: Available to all       │
│ - Coupon validation: Server-side calculation    │
└─────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│ LAYER 4: Coupon Validation (Server-Side)        │
│ - Coupon codes validated & calculated on server │
│ - Client CANNOT modify coupon amount             │
│ - Discount amount sent from server to client    │
│ - Order creation with coupon is atomic          │
└─────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│ LAYER 5: Data Integrity                         │
│ - Usage count incremented on successful order   │
│ - Expired coupons auto-rejected                 │
│ - Usage limits enforced per coupon              │
│ - User-specific coupons verified via userId     │
└─────────────────────────────────────────────────┘
```

---

## 📈 Scaling Considerations

```
CURRENT (Local/Single Server):
├─ JSON file storage (coupons.json, orders.json)
├─ Works fine for <1000 daily orders
└─ Suitable for startup/MVP phase

FUTURE SCALING (MongoDB Required):
├─ Use MongoDB for better performance
├─ Add Redis for coupon rate limiting
├─ Implement coupon analytics
└─ Add email/SMS coupon notifications

ENTERPRISE (Not needed now):
├─ Multi-region deployment
├─ Database sharding
├─ Real-time inventory management
└─ Advanced fraud detection
```

---

**System ready for production! 🚀**
