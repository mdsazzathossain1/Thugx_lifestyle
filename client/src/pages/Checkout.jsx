import { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/helpers';

const checkoutSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').or(z.literal('')).optional(),
  phone: z.string().min(1, 'Phone is required'),
  street: z.string().min(1, 'Street / Area is required'),
  city: z.string().min(1, 'City / Thana is required'),
  state: z.string().min(1, 'District is required'),
  zipCode: z.string().optional(),
});

const DELIVERY_OPTIONS = [
  { value: 'inside_dhaka', label: 'Inside Dhaka', description: 'Delivery within Dhaka city' },
  { value: 'outside_dhaka', label: 'Outside Dhaka', description: 'Whole Bangladesh delivery' },
];

const PAYMENT_OPTIONS = [
  {
    value: 'full',
    label: 'Full Payment',
    description: 'Pay the complete amount via bKash / Nagad / Rocket',
    badge: 'bKash • Nagad • Rocket',
    badgeClass: 'text-green-600',
  },
  {
    value: 'delivery_only',
    label: 'Cash on Delivery (COD)',
    description: 'Pay only the delivery charge now. Product amount paid on delivery.',
    badge: 'Pay advance now',
    badgeClass: 'text-amber-600',
  },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState(null);
  const [deliveryType, setDeliveryType] = useState('inside_dhaka');
  const [paymentType, setPaymentType] = useState('full');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    api.get('/settings').then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  const deliveryCharge = settings
    ? (deliveryType === 'outside_dhaka'
        ? (settings.deliveryCharges?.outsideDhaka ?? 120)
        : (settings.deliveryCharges?.insideDhaka ?? 60))
    : (deliveryType === 'outside_dhaka' ? 120 : 60);

  const totalAmount = subtotal + deliveryCharge - couponDiscount;
  const paymentAmount = paymentType === 'delivery_only' ? deliveryCharge : totalAmount;

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Enter a coupon code');
      return;
    }

    setValidatingCoupon(true);
    try {
      const { data } = await api.post('/coupons/validate', {
        code: couponCode.trim(),
        orderAmount: subtotal,
        userId: user?._id,
      });

      setCouponDiscount(data.discountAmount);
      setAppliedCoupon(data);
      toast.success('Coupon applied!');
    } catch (err) {
      setCouponDiscount(0);
      setAppliedCoupon(null);
      toast.error(err.response?.data?.message || 'Invalid coupon code');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setAppliedCoupon(null);
    toast.success('Coupon removed');
  };

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
  });

  if (items.length === 0) return <Navigate to="/cart" replace />;

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const orderData = {
        customer: {
          name: formData.name,
          email: formData.email || '',
          phone: formData.phone,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode || '',
            country: 'Bangladesh',
          },
        },
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        deliveryType,
        paymentType,
        couponCode: appliedCoupon?.code || null,
      };

      const { data } = await api.post('/orders', orderData);
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order/${data.orderNumber}/payment`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section-padding">
      <div className="container-custom max-w-5xl">
        <h1 className="heading-lg mb-8">Checkout</h1>

        {!user && (
          <div className="bg-light border border-border rounded-lg p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">Already have an account? Log in for faster checkout.</p>
            <Link to="/login?redirect=/checkout" className="btn-secondary !py-2 !px-6 text-sm">Login</Link>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ── Left Column ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Shipping Details */}
              <div className="bg-white border border-border rounded-lg p-6">
                <h2 className="font-heading text-xl font-semibold mb-6">Shipping Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Full Name *</label>
                    <input {...register('name')} className="input-field" placeholder="আপনার পূর্ণ নাম" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Phone *</label>
                    <input {...register('phone')} className="input-field" placeholder="01XXXXXXXXX" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                    <input {...register('email')} type="email" className="input-field" placeholder="email@example.com" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Street / Area *</label>
                    <input {...register('street')} className="input-field" placeholder="House no, Road, Area" />
                    {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">City / Thana *</label>
                    <input {...register('city')} className="input-field" placeholder="Dhaka" />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">District *</label>
                    <input {...register('state')} className="input-field" placeholder="Dhaka" />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Postal Code</label>
                    <input {...register('zipCode')} className="input-field" placeholder="1200" />
                  </div>
                </div>
              </div>

              {/* Delivery Option */}
              <div className="bg-white border border-border rounded-lg p-6">
                <h2 className="font-heading text-xl font-semibold mb-5">Delivery Option</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DELIVERY_OPTIONS.map((opt) => {
                    const charge = settings
                      ? (opt.value === 'inside_dhaka'
                          ? settings.deliveryCharges?.insideDhaka
                          : settings.deliveryCharges?.outsideDhaka)
                      : (opt.value === 'inside_dhaka' ? 60 : 120);
                    return (
                      <label
                        key={opt.value}
                        className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          deliveryType === opt.value
                            ? 'border-secondary bg-secondary/5'
                            : 'border-border hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryType"
                          value={opt.value}
                          checked={deliveryType === opt.value}
                          onChange={() => setDeliveryType(opt.value)}
                          className="mt-0.5 accent-secondary flex-shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-sm">{opt.label}</p>
                          <p className="text-xs text-gray-500">{opt.description}</p>
                          <p className="text-sm font-bold text-primary mt-1">{formatPrice(charge)}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Payment Option */}
              <div className="bg-white border border-border rounded-lg p-6">
                <h2 className="font-heading text-xl font-semibold mb-5">Payment Option</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentType === opt.value
                          ? 'border-secondary bg-secondary/5'
                          : 'border-border hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentType"
                        value={opt.value}
                        checked={paymentType === opt.value}
                        onChange={() => setPaymentType(opt.value)}
                        className="mt-0.5 accent-secondary flex-shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-sm">{opt.label}</p>
                        <p className="text-xs text-gray-500">{opt.description}</p>
                        <p className={`text-xs font-medium mt-1 ${opt.badgeClass}`}>{opt.badge}</p>
                        {opt.value === 'delivery_only' && (
                          <p className="text-xs text-amber-700 font-semibold mt-0.5">
                            Advance: {formatPrice(deliveryCharge)}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right Column: Order Summary ── */}
            <div className="lg:col-span-1">
              <div className="bg-light border border-border rounded-lg p-6 sticky top-24 space-y-4">
                <h2 className="font-heading text-xl font-semibold">Order Summary</h2>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center space-x-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded bg-white"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Coupon Section */}
                <div className="border-t border-border pt-4">
                  {appliedCoupon ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-green-800 text-sm">{appliedCoupon.code}</span>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-xs text-green-700 hover:underline font-medium"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-xs text-green-700">{appliedCoupon.description}</p>
                      <p className="text-sm font-bold text-green-800 mt-1">-{formatPrice(couponDiscount)}</p>
                    </div>
                  ) : (
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && handleValidateCoupon()}
                        placeholder="Promo code"
                        className="input-field text-sm flex-1"
                      />
                      <button
                        type="button"
                        onClick={handleValidateCoupon}
                        disabled={validatingCoupon}
                        className="btn-secondary text-sm py-2 px-3"
                      >
                        {validatingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Pricing Summary */}
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Delivery ({deliveryType === 'inside_dhaka' ? 'Inside' : 'Outside'} Dhaka)
                    </span>
                    <span className="font-medium text-primary">{formatPrice(deliveryCharge)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-700 font-medium">
                      <span>Discount</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatPrice(totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {paymentType === 'delivery_only' && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-xs text-amber-800 font-semibold">
                      Pay now (advance): {formatPrice(deliveryCharge)}
                    </p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Pay on delivery: {formatPrice(subtotal - couponDiscount)}
                    </p>
                  </div>
                )}

                {paymentType === 'full' && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-xs text-green-800 font-semibold">
                      Pay via bKash / Nagad / Rocket
                    </p>
                    <p className="text-xs text-green-600 mt-0.5">
                      Amount: {formatPrice(paymentAmount)}
                    </p>
                  </div>
                )}

                <button type="submit" disabled={submitting} className="btn-primary w-full">
                  {submitting ? 'Placing Order...' : 'Place Order'}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Payment instructions will be shown after placing order.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;


