import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { formatPrice, formatDateTime, getStatusColor, getStatusLabel } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ORDER_STEPS = ['pending', 'payment_submitted', 'confirmed', 'processing', 'shipped', 'delivered'];

const OrderTracking = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/api/orders/${orderNumber}`);
        setOrder(data);
      } catch (err) {
        console.error('Failed to fetch order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderNumber]);

  if (loading) return <LoadingSpinner />;

  if (!order) {
    return (
      <div className="section-padding text-center">
        <h1 className="heading-lg mb-4">Order Not Found</h1>
        <p className="text-gray-500 mb-6">We couldn&apos;t find an order with that number.</p>
        <Link to="/shop" className="btn-primary inline-block">Continue Shopping</Link>
      </div>
    );
  }

  const currentStepIndex = order.status === 'cancelled' ? -1 : ORDER_STEPS.indexOf(order.status);

  return (
    <div className="section-padding">
      <div className="container-custom max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="heading-lg mb-2">Order Tracking</h1>
          <p className="text-gray-500">
            Order <span className="font-semibold text-primary">{order.orderNumber}</span>
          </p>
        </div>

        {/* Status Badge */}
        <div className="text-center mb-8">
          <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
            {getStatusLabel(order.status)}
          </span>
        </div>

        {/* Timeline */}
        {order.status !== 'cancelled' && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-2">
              {ORDER_STEPS.map((step, index) => (
                <div key={step} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      index <= currentStepIndex
                        ? 'bg-secondary text-primary'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {index <= currentStepIndex ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-xs mt-2 text-center text-gray-500 hidden sm:block">
                    {getStatusLabel(step)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex mt-1">
              {ORDER_STEPS.slice(0, -1).map((_, index) => (
                <div key={index} className="flex-1 px-4">
                  <div
                    className={`h-1 rounded ${
                      index < currentStepIndex ? 'bg-secondary' : 'bg-gray-200'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Items */}
          <div className="bg-white border border-border rounded-lg p-6">
            <h2 className="font-heading text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {item.productImage && (
                      <img src={item.productImage} alt={item.productName} className="w-12 h-12 object-cover rounded" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} x {formatPrice(item.price)}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Shipping */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h2 className="font-heading text-lg font-semibold mb-4">Shipping Details</h2>
              <div className="text-sm space-y-1 text-gray-600">
                <p className="font-medium text-primary">{order.customer.name}</p>
                <p>{order.customer.phone}</p>
                {order.customer.email && <p>{order.customer.email}</p>}
                <p>{order.customer.address.street}</p>
                <p>{order.customer.address.city}, {order.customer.address.state}</p>
                <p>{order.customer.address.country}</p>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h2 className="font-heading text-lg font-semibold mb-4">Payment Info</h2>
              {order.paymentDetails?.transactionId ? (
                <div className="text-sm space-y-1 text-gray-600">
                  <p>Transaction ID: <span className="font-medium text-primary">{order.paymentDetails.transactionId}</span></p>
                  {order.paymentDetails.submittedAt && (
                    <p>Submitted: {formatDateTime(order.paymentDetails.submittedAt)}</p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-500 mb-3">Payment details not yet submitted.</p>
                  <Link to={`/order/${order.orderNumber}/payment`} className="btn-primary text-sm !py-2">
                    Submit Payment
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status History */}
        {order.statusHistory?.length > 0 && (
          <div className="mt-8 bg-white border border-border rounded-lg p-6">
            <h2 className="font-heading text-lg font-semibold mb-4">Status History</h2>
            <div className="space-y-3">
              {order.statusHistory.map((entry, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-secondary rounded-full" />
                    <span className="font-medium">{getStatusLabel(entry.status)}</span>
                  </div>
                  <span className="text-gray-500">{formatDateTime(entry.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
