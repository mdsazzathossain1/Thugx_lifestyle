import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../utils/api';
import { formatPrice, formatDateTime, getStatusColor, getStatusLabel } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StatCard = ({ label, value, color = 'text-primary' }) => (
  <div className="bg-white border border-border rounded-lg p-6">
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await adminApi.get('/admin/dashboard');
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-primary mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Orders" value={stats?.totalOrders || 0} />
        <StatCard label="Pending Payments" value={stats?.pendingPayments || 0} color="text-blue-600" />
        <StatCard label="Total Revenue" value={formatPrice(stats?.totalRevenue || 0)} color="text-green-600" />
        <StatCard label="Total Costs" value={formatPrice(stats?.totalCosts || 0)} color="text-red-600" />
        <StatCard label="Net Profit" value={formatPrice(stats?.netProfit || 0)} color="text-indigo-600" />
        <StatCard label="Low Stock Products" value={stats?.lowStockProducts || 0} color="text-red-600" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Orders Today" value={stats?.todayOrders || 0} />
        <StatCard label="Orders This Week" value={stats?.weekOrders || 0} />
        <StatCard label="Orders This Month" value={stats?.monthOrders || 0} />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link to="/admin/products/new" className="btn-primary text-sm !py-2">
          Add New Product
        </Link>
        <Link to="/admin/orders?status=payment_submitted" className="btn-secondary text-sm !py-2">
          Review Payments ({stats?.pendingPayments || 0})
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold">Recent Orders</h2>
          <Link to="/admin/orders" className="text-secondary text-sm hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Order #</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats?.recentOrders?.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-light transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/admin/orders/${order._id}`} className="text-secondary font-medium hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm">{order.customer?.name}</td>
                    <td className="px-6 py-4 text-sm font-medium">{formatPrice(order.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(order.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No orders yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
