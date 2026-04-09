import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../utils/api';
import { formatPrice, formatDateTime, getStatusColor, getStatusLabel } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await adminApi.get(`/api/admin/orders/${id}`);
        setOrder(data);
      } catch (err) {
        console.error('Failed to fetch order:', err);
        toast.error('Order not found');
        navigate('/admin/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  const handleConfirmPayment = async () => {
    if (!window.confirm('Confirm this payment?')) return;
    setUpdating(true);
    try {
      const { data } = await adminApi.put(`/api/admin/orders/${id}/confirm`);
      setOrder(data.order);
      toast.success('Payment confirmed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm payment');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Update order status to "${getStatusLabel(newStatus)}"?`)) return;
    setUpdating(true);
    try {
      const { data } = await adminApi.put(`/api/admin/orders/${id}/status`, { status: newStatus });
      setOrder(data.order);
      toast.success('Order status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!order) return null;

  const statusFlow = ['confirmed', 'processing', 'shipped', 'delivered'];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <button onClick={() => navigate('/admin/orders')} className="text-sm text-gray-500 hover:text-secondary mb-2">
            &larr; Back to Orders
          </button>
          <h1 className="font-heading text-2xl font-bold text-primary">
            Order {order.orderNumber}
          </h1>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
          {getStatusLabel(order.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white border border-border rounded-lg p-6">
            <h2 className="font-heading text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-light rounded-md">
                  <div className="flex items-center space-x-3">
                    {item.productImage && (
                      <img src={item.productImage} alt={item.productName} className="w-14 h-14 object-cover rounded" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{item.productName}</p>
                      <p className="text-xs text-gray-500">
                        {formatPrice(item.price)} x {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white border border-border rounded-lg p-6">
            <h2 className="font-heading text-lg font-semibold mb-4">Payment Details</h2>
            {order.paymentDetails?.transactionId ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-medium">{order.paymentDetails.transactionId}</span>
                </div>
                {order.paymentDetails.submittedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Submitted At</span>
                    <span>{formatDateTime(order.paymentDetails.submittedAt)}</span>
                  </div>
                )}
                {order.paymentDetails.transactionProof && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Transaction Proof:</p>
                    <a
                      href={order.paymentDetails.transactionProof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={order.paymentDetails.transactionProof}
                        alt="Transaction proof"
                        className="max-w-sm rounded-lg border border-border"
                      />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No payment details submitted yet.</p>
            )}
          </div>

          {/* Status History */}
          <div className="bg-white border border-border rounded-lg p-6">
            <h2 className="font-heading text-lg font-semibold mb-4">Status History</h2>
            <div className="space-y-3">
              {order.statusHistory?.map((entry, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-secondary rounded-full" />
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(entry.status)}`}>
                      {getStatusLabel(entry.status)}
                    </span>
                    <span className="text-gray-400">by {entry.updatedBy}</span>
                  </div>
                  <span className="text-gray-500">{formatDateTime(entry.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white border border-border rounded-lg p-6">
            <h2 className="font-heading text-lg font-semibold mb-4">Actions</h2>

            {order.status === 'payment_submitted' && (
              <button
                onClick={handleConfirmPayment}
                disabled={updating}
                className="btn-gold w-full mb-3 text-sm"
              >
                {updating ? 'Confirming...' : 'Confirm Payment'}
              </button>
            )}

            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 mb-2">Update Status:</p>
                {statusFlow
                  .filter((s) => {
                    const currentIndex = statusFlow.indexOf(order.status);
                    const targetIndex = statusFlow.indexOf(s);
                    return targetIndex > currentIndex && currentIndex !== -1;
                  })
                  .map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(status)}
                      disabled={updating}
                      className="btn-secondary w-full text-sm !py-2"
                    >
                      Mark as {getStatusLabel(status)}
                    </button>
                  ))}
                <button
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={updating}
                  className="w-full text-sm py-2 px-4 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                  Cancel Order
                </button>
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="bg-white border border-border rounded-lg p-6">
            <h2 className="font-heading text-lg font-semibold mb-4">Customer</h2>
            <div className="text-sm space-y-1 text-gray-600">
              <p className="font-medium text-primary">{order.customer.name}</p>
              <p>{order.customer.phone}</p>
              {order.customer.email && <p>{order.customer.email}</p>}
              <div className="border-t border-border mt-3 pt-3">
                <p className="text-xs text-gray-400 mb-1">Shipping Address:</p>
                <p>{order.customer.address.street}</p>
                <p>{order.customer.address.city}, {order.customer.address.state}</p>
                {order.customer.address.zipCode && <p>{order.customer.address.zipCode}</p>}
                <p>{order.customer.address.country}</p>
              </div>
            </div>
          </div>

          {/* Order Meta */}
          <div className="bg-white border border-border rounded-lg p-6">
            <h2 className="font-heading text-lg font-semibold mb-4">Order Info</h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Date</span>
                <span>{formatDateTime(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span>{formatDateTime(order.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
