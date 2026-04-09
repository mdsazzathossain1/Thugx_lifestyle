import { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiTrash, HiEye, HiEyeOff } from 'react-icons/hi';
import { adminApi } from '../../utils/api';
import { formatPrice } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    userSpecific: false,
    allowedUsers: [],
    isActive: true,
    expiresAt: '',
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.get('/api/admin/coupons');
      setCoupons(data.coupons || []);
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await adminApi.get('/api/admin/users');
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchUsers();
  }, []);

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      usageLimit: '',
      userSpecific: false,
      allowedUsers: [],
      isActive: true,
      expiresAt: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (coupon) => {
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minOrderAmount: String(coupon.minOrderAmount || ''),
      maxDiscountAmount: coupon.maxDiscountAmount ? String(coupon.maxDiscountAmount) : '',
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
      userSpecific: coupon.userSpecific,
      allowedUsers: coupon.allowedUsers || [],
      isActive: coupon.isActive,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split('T')[0] : '',
    });
    setEditingId(coupon._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      };

      if (editingId) {
        await adminApi.put(`/api/admin/coupons/${editingId}`, payload);
        toast.success('Coupon updated');
      } else {
        await adminApi.post('/api/admin/coupons', payload);
        toast.success('Coupon created');
      }

      fetchCoupons();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon');
    }
  };

  const handleDelete = async (id, code) => {
    if (confirm(`Delete coupon "${code}"?`)) {
      try {
        await adminApi.delete(`/admin/coupons/${id}`);
        toast.success('Coupon deleted');
        fetchCoupons();
      } catch (err) {
        toast.error('Failed to delete coupon');
      }
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await adminApi.put(`/admin/coupons/${coupon._id}`, {
        isActive: !coupon.isActive,
      });
      fetchCoupons();
    } catch (err) {
      toast.error('Failed to update coupon');
    }
  };

  if (loading && !showForm) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="heading-lg">Coupons & Discounts</h1>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="btn-primary flex items-center gap-2"
        >
          <HiPlus className="w-5 h-5" />
          {showForm ? 'Cancel' : 'New Coupon'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit' : 'Create'} Coupon</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium mb-1">Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., SUMMER20, WELCOME10"
                  required
                  className="input-field"
                />
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium mb-1">Discount Type *</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="input-field"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (৳)</option>
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Discount Value ({formData.discountType === 'percentage' ? '%' : '৳'}) *
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  placeholder={formData.discountType === 'percentage' ? '20' : '1000'}
                  required
                  className="input-field"
                />
              </div>

              {/* Min Order Amount */}
              <div>
                <label className="block text-sm font-medium mb-1">Minimum Order Amount (৳)</label>
                <input
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  placeholder="0"
                  className="input-field"
                />
              </div>

              {/* Max Discount (for %) */}
              {formData.discountType === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Max Discount Amount (৳)</label>
                  <input
                    type="number"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    placeholder="Optional"
                    className="input-field"
                  />
                </div>
              )}

              {/* Usage Limit */}
              <div>
                <label className="block text-sm font-medium mb-1">Usage Limit</label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="Leave empty for unlimited"
                  className="input-field"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Summer sale discount"
                className="input-field"
              />
            </div>

            {/* User-specific */}
            <div className="border-t pt-4">
              <label className="flex items-center gap-2 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={formData.userSpecific}
                  onChange={(e) => setFormData({ ...formData, userSpecific: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="font-medium text-sm">User-Specific Coupon</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">
                {formData.userSpecific
                  ? 'This coupon will only be usable by selected users.'
                  : 'This coupon is available to all users.'}
              </p>

              {formData.userSpecific && users.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Select Users</label>
                  <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
                    {users.map((user) => (
                      <label key={user._id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.allowedUsers.includes(user._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                allowedUsers: [...formData.allowedUsers, user._id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                allowedUsers: formData.allowedUsers.filter((id) => id !== user._id),
                              });
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">
                          {user.name}
                          {user.email && <span className="text-gray-500 ml-2">({user.email})</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Active Status */}
            <div className="border-t pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="font-medium text-sm">Active</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button type="submit" className="btn-primary flex-1">
                {editingId ? 'Update Coupon' : 'Create Coupon'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      {coupons.length === 0 ? (
        <div className="bg-light border border-border rounded-lg p-8 text-center">
          <p className="text-gray-500">No coupons created yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon._id}
              className={`bg-white border rounded-lg p-4 flex items-start justify-between ${
                coupon.isActive ? 'border-border' : 'border-red-300 bg-red-50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-lg text-primary">{coupon.code}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      coupon.discountType === 'percentage'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}%`
                      : `৳${coupon.discountValue}`}
                  </span>
                  {!coupon.isActive && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                      Inactive
                    </span>
                  )}
                </div>

                {coupon.description && (
                  <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
                )}

                <div className="text-xs text-gray-500 space-y-1">
                  {coupon.minOrderAmount > 0 && (
                    <p>• Min order: {formatPrice(coupon.minOrderAmount)}</p>
                  )}
                  {coupon.discountType === 'percentage' && coupon.maxDiscountAmount && (
                    <p>• Max discount: {formatPrice(coupon.maxDiscountAmount)}</p>
                  )}
                  {coupon.usageLimit && (
                    <p>
                      • Uses: {coupon.usageCount || 0} / {coupon.usageLimit}
                    </p>
                  )}
                  {coupon.expiresAt && (
                    <p>• Expires: {new Date(coupon.expiresAt).toLocaleDateString()}</p>
                  )}
                  {coupon.userSpecific && (
                    <p>• User-specific ({coupon.allowedUsers?.length || 0} users)</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleToggleActive(coupon)}
                  className={`p-2 rounded transition-colors ${
                    coupon.isActive
                      ? 'bg-green-50 text-green-600 hover:bg-green-100'
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                  title={coupon.isActive ? 'Deactivate' : 'Activate'}
                >
                  {coupon.isActive ? (
                    <HiEye className="w-5 h-5" />
                  ) : (
                    <HiEyeOff className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(coupon)}
                  className="p-2 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  <HiPencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(coupon._id, coupon.code)}
                  className="p-2 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  <HiTrash className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Coupons;
