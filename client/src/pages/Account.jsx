import { useState, useEffect } from 'react';
import { Navigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Profile Tab
const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || 'Nigeria',
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await updateProfile({
        name: data.name,
        phone: data.phone,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
        },
      });
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="font-heading text-2xl font-semibold mb-6">My Profile</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-border rounded-lg p-6 space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
            <input {...register('name')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input value={user?.email || ''} disabled className="input-field bg-gray-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
            <input {...register('phone')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Country</label>
            <input {...register('country')} className="input-field" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">Street Address</label>
            <input {...register('street')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">City</label>
            <input {...register('city')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">State</label>
            <input {...register('state')} className="input-field" />
          </div>
        </div>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

// Orders Tab
const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/api/auth/orders');
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 className="font-heading text-2xl font-semibold mb-6">Order History</h2>
      {orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">No orders yet</p>
          <Link to="/shop" className="btn-primary inline-block">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/order/${order.orderNumber}`}
              className="block bg-white border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-primary">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                  <p className="text-sm text-gray-500">{order.items.length} item(s)</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{formatPrice(order.totalAmount)}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Account Page
const Account = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login?redirect=/account" replace />;

  const tabs = [
    { path: '/account', label: 'Profile' },
    { path: '/account/orders', label: 'Orders' },
  ];

  return (
    <div className="section-padding">
      <div className="container-custom">
        <h1 className="heading-lg mb-8">My Account</h1>

        {/* Tabs */}
        <div className="flex space-x-6 border-b border-border mb-8">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path ||
              (tab.path === '/account' && location.pathname === '/account/profile');
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-gray-500 hover:text-primary'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <Routes>
          <Route index element={<Profile />} />
          <Route path="profile" element={<Profile />} />
          <Route path="orders" element={<OrderHistory />} />
        </Routes>
      </div>
    </div>
  );
};

export default Account;
