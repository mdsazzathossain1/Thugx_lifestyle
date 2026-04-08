import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { HiSearch } from 'react-icons/hi';
import { adminApi } from '../../utils/api';
import { formatPrice, formatDateTime, getStatusColor, getStatusLabel } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const STATUSES = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'payment_submitted', label: 'Payment Submitted' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const Orders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const currentStatus = searchParams.get('status') || 'all';
  const currentPage = parseInt(searchParams.get('page') || '1');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentStatus !== 'all') params.set('status', currentStatus);
      if (search) params.set('search', search);
      params.set('page', currentPage.toString());
      params.set('limit', '20');

      const { data } = await adminApi.get(`/admin/orders?${params}`);
      setOrders(data.orders);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentStatus, currentPage]);

  const handleStatusFilter = (status) => {
    setSearchParams({ status, page: '1' });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-primary mb-8">Orders</h1>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => handleStatusFilter(s.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              currentStatus === s.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-md">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, customer name, or phone..."
            className="input-field !pl-10"
          />
        </div>
      </form>

      {/* Orders Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{total} order(s) found</p>

          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-light">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Order #</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Items</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order._id} className="hover:bg-light transition-colors">
                        <td className="px-6 py-4 font-medium text-sm">{order.orderNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(order.createdAt)}</td>
                        <td className="px-6 py-4 text-sm">
                          <p className="font-medium">{order.customer?.name}</p>
                          <p className="text-xs text-gray-400">{order.customer?.phone}</p>
                        </td>
                        <td className="px-6 py-4 text-sm">{order.items?.length} item(s)</td>
                        <td className="px-6 py-4 text-sm font-medium">{formatPrice(order.totalAmount)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/admin/orders/${order._id}`}
                            className="text-secondary text-sm font-medium hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">No orders found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setSearchParams({ status: currentStatus, page: page.toString() })}
                  className={`w-8 h-8 rounded text-sm ${
                    page === currentPage ? 'bg-primary text-white' : 'hover:bg-light'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;
