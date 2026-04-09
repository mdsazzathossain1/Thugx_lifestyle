import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { formatPrice } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';

const METHOD_STYLES = {
  bKash:  { bg: 'bg-pink-600',   text: 'text-white', ring: 'ring-pink-400' },
  Nagad:  { bg: 'bg-orange-500', text: 'text-white', ring: 'ring-orange-400' },
  Rocket: { bg: 'bg-purple-600', text: 'text-white', ring: 'ring-purple-400' },
};

const OrderPayment = () => {
  const { orderNumber } = useParams();
  const [order, setOrder]       = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: o }, { data: s }] = await Promise.all([
          api.get(`/api/orders/${orderNumber}`),
          api.get('/api/settings'),
        ]);
        setOrder(o);
        setSettings(s);
        if (o.status !== 'pending') setSubmitted(true);
        const active = (s?.paymentMethods || []).filter((m) => m.isActive);
        if (active.length) setSelectedMethod(active[0].name);
      } catch {
        toast.error('Order not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderNumber]);

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('transactionId',    formData.transactionId);
      fd.append('paymentMethod',    selectedMethod || '');
      if (formData.transactionProof?.[0]) {
        fd.append('transactionProof', formData.transactionProof[0]);
      }
      await api.put(`/api/orders/${orderNumber}/payment`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Payment details submitted!');
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!order)  return (
    <div className="section-padding text-center">
      <p className="text-gray-500 text-lg">Order not found</p>
    </div>
  );

  const activeMethods  = (settings?.paymentMethods || []).filter((m) => m.isActive);
  const currentMethod  = activeMethods.find((m) => m.name === selectedMethod);
  const isDeliveryOnly = order.paymentType === 'delivery_only';
  const deliveryCharge = order.deliveryCharge || 0;
  const productSubtotal = order.totalAmount - deliveryCharge;
  const amountToPay    = isDeliveryOnly ? deliveryCharge : order.totalAmount;

  return (
    <div className="section-padding">
      <div className="container-custom max-w-3xl">

        {/* ─── Success Header ─── */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="heading-lg mb-2">Order Placed!</h1>
          <p className="text-gray-500">
            Order <span className="font-semibold text-primary">{order.orderNumber}</span>
          </p>
        </div>

        {/* ─── Order Summary ─── */}
        <div className="bg-white border border-border rounded-lg p-6 mb-6">
          <h2 className="font-heading text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {item.productImage && (
                    <img src={item.productImage} alt={item.productName}
                         className="w-10 h-10 object-cover rounded" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{item.productName}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="text-sm font-medium">{formatPrice(item.subtotal)}</span>
              </div>
            ))}

            <div className="border-t border-border pt-3 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Product Subtotal</span>
                <span>{formatPrice(productSubtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>
                  Delivery ({order.deliveryType === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})
                </span>
                <span>{formatPrice(deliveryCharge)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1.5 border-t border-border">
                <span>Grand Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Payment Section ─── */}
        {!submitted ? (
          <>
            <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-6 mb-6">
              <h2 className="font-heading text-xl font-semibold mb-3 text-primary">
                {isDeliveryOnly ? 'Pay Advance (Delivery Charge Only)' : 'Complete Payment'}
              </h2>

              {isDeliveryOnly && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 font-semibold">
                    Cash on Delivery — Pay advance now: {formatPrice(amountToPay)}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Remaining ({formatPrice(productSubtotal)}) will be collected at your door.
                  </p>
                </div>
              )}

              {!isDeliveryOnly && (
                <p className="text-gray-700 mb-4">
                  Send exactly <span className="font-bold text-primary">{formatPrice(amountToPay)}</span> to the
                  selected payment method below.
                </p>
              )}

              {/* Method Tabs */}
              {activeMethods.length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {activeMethods.map((m) => {
                      const s = METHOD_STYLES[m.name] || { bg: 'bg-gray-600', text: 'text-white', ring: 'ring-gray-400' };
                      const isSelected = selectedMethod === m.name;
                      return (
                        <button
                          key={m.name}
                          type="button"
                          onClick={() => setSelectedMethod(m.name)}
                          className={`px-5 py-2 rounded-full text-sm font-bold transition-all border-2 ${
                            isSelected
                              ? `${s.bg} ${s.text} border-transparent ring-2 ring-offset-1 ${s.ring}`
                              : 'bg-white border-border text-gray-600 hover:border-gray-400'
                          }`}
                        >
                          {m.name}
                        </button>
                      );
                    })}
                  </div>

                  {currentMethod && (
                    <div className="bg-white rounded-lg border border-border p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-600">
                          Send to {currentMethod.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(currentMethod.number);
                            toast.success('Number copied!');
                          }}
                          className="text-xs bg-secondary/20 text-primary px-3 py-1 rounded-md hover:bg-secondary/30 transition"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-3xl font-bold tracking-widest text-primary font-mono">
                        {currentMethod.number}
                      </p>
                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <span className="text-sm text-gray-500">Amount to send</span>
                        <span className="text-xl font-bold text-secondary">{formatPrice(amountToPay)}</span>
                      </div>
                      {currentMethod.instructions && (
                        <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
                          {currentMethod.instructions}
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">Payment methods not configured. Please contact support.</p>
              )}
            </div>

            {/* ─── Submit Payment Form ─── */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h2 className="font-heading text-xl font-semibold mb-4">Submit Payment Details</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Transaction ID *
                    <span className="text-xs text-gray-400 ml-2">(from bKash/Nagad/Rocket confirmation)</span>
                  </label>
                  <input
                    {...register('transactionId', { required: 'Transaction ID is required' })}
                    className="input-field font-mono"
                    placeholder="e.g. 8N3K2A7BQ1"
                  />
                  {errors.transactionId && (
                    <p className="text-red-500 text-xs mt-1">{errors.transactionId.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Screenshot / Proof (optional)
                  </label>
                  <input
                    {...register('transactionProof')}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="input-field"
                  />
                  <p className="text-xs text-gray-400 mt-1">Upload screenshot of your payment confirmation</p>
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full">
                  {submitting ? 'Submitting...' : 'Submit Payment Details'}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-heading text-lg font-semibold text-blue-800 mb-2">Payment Submitted</h3>
            <p className="text-blue-600 text-sm mb-4">
              Your payment is under review. We&apos;ll confirm shortly.
            </p>
            <Link to={`/order/${orderNumber}`} className="btn-primary inline-block">
              Track Your Order
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPayment;
