import { useState, useEffect } from 'react';
import { adminApi } from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { HiPlus, HiTrash, HiOutlineSave } from 'react-icons/hi';

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    adminApi
      .get('/admin/settings')
      .then((r) => setSettings(r.data))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  /* ── helpers ── */
  const updateDelivery = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      deliveryCharges: { ...prev.deliveryCharges, [field]: Number(value) || 0 },
    }));
  };

  const updateMethod = (index, field, value) => {
    setSettings((prev) => {
      const methods = [...prev.paymentMethods];
      methods[index] = { ...methods[index], [field]: value };
      return { ...prev, paymentMethods: methods };
    });
  };

  const addMethod = () => {
    setSettings((prev) => ({
      ...prev,
      paymentMethods: [
        ...prev.paymentMethods,
        { name: '', number: '', instructions: '', isActive: true },
      ],
    }));
  };

  const removeMethod = (index) => {
    setSettings((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter((_, i) => i !== index),
    }));
  };

  const addCategory = () => {
    setSettings((prev) => ({
      ...prev,
      categories: [...(prev.categories || []), { slug: '', label: '' }],
    }));
  };

  const removeCategory = (index) => {
    setSettings((prev) => ({
      ...prev,
      categories: (prev.categories || []).filter((_, i) => i !== index),
    }));
  };

  const updateCategory = (index, field, value) => {
    setSettings((prev) => {
      const cats = [...(prev.categories || [])];
      cats[index] = { ...cats[index], [field]: value };
      return { ...prev, categories: cats };
    });
  };

  const save = async () => {
    // Validate payment methods
    for (const m of settings.paymentMethods) {
      if (!m.name.trim() || !m.number.trim()) {
        toast.error('Each payment method must have a name and number');
        return;
      }
    }
    // Validate categories
    for (const cat of (settings.categories || [])) {
      if (!cat.label.trim() || !cat.slug.trim()) {
        toast.error('Each category must have a label and a slug');
        return;
      }
      if (!/^[a-z0-9_-]+$/.test(cat.slug)) {
        toast.error(`Slug "${cat.slug}" must be lowercase letters, numbers, hyphens or underscores`);
        return;
      }
    }
    setSaving(true);
    try {
      const { data } = await adminApi.put('/admin/settings', settings);
      setSettings(data);
      toast.success('Settings saved successfully!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!settings) return <p className="text-gray-500">No settings found. Please restart the server.</p>;

  return (
    <div className="max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">Store Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Delivery charges &amp; payment method configuration</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="btn-primary flex items-center space-x-2"
        >
          <HiOutlineSave className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* ── Delivery Charges ── */}
      <div className="bg-white border border-border rounded-lg p-6 mb-6">
        <h2 className="font-heading text-xl font-semibold mb-1">Delivery Charges</h2>
        <p className="text-sm text-gray-500 mb-5">Set delivery fees in BDT (Taka ৳)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inside Dhaka (৳)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">৳</span>
              <input
                type="number"
                value={settings.deliveryCharges?.insideDhaka ?? 0}
                onChange={(e) => updateDelivery('insideDhaka', e.target.value)}
                className="input-field pl-7"
                min="0"
                step="1"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Outside Dhaka / Whole Bangladesh (৳)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">৳</span>
              <input
                type="number"
                value={settings.deliveryCharges?.outsideDhaka ?? 0}
                onChange={(e) => updateDelivery('outsideDhaka', e.target.value)}
                className="input-field pl-7"
                min="0"
                step="1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Payment Methods ── */}
      <div className="bg-white border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-heading text-xl font-semibold">Payment Methods</h2>
          <button
            onClick={addMethod}
            className="btn-secondary flex items-center space-x-1.5 !py-2 !px-4 text-sm"
          >
            <HiPlus className="w-4 h-4" />
            <span>Add Method</span>
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Configure bKash, Nagad, Rocket or any mobile banking number. Customers will see these at checkout.
        </p>

        {settings.paymentMethods?.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6 border border-dashed border-border rounded-lg">
            No payment methods yet. Click &quot;Add Method&quot; to add one.
          </p>
        )}

        <div className="space-y-4">
          {settings.paymentMethods?.map((method, i) => (
            <div
              key={i}
              className={`border-2 rounded-lg p-4 space-y-3 transition-colors ${
                method.isActive ? 'border-border' : 'border-border opacity-60'
              }`}
            >
              {/* Row 1: active toggle + delete */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      method.isActive ? 'bg-secondary' : 'bg-gray-300'
                    }`}
                    onClick={() => updateMethod(i, 'isActive', !method.isActive)}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        method.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {method.isActive ? 'Visible to customers' : 'Hidden'}
                  </span>
                </label>
                <button
                  onClick={() => removeMethod(i)}
                  className="text-red-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
                  title="Remove method"
                >
                  <HiTrash className="w-4 h-4" />
                </button>
              </div>

              {/* Row 2: Name + Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Method Name
                  </label>
                  <input
                    value={method.name}
                    onChange={(e) => updateMethod(i, 'name', e.target.value)}
                    className="input-field !py-2 text-sm"
                    placeholder="e.g. bKash"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Phone Number
                  </label>
                  <input
                    value={method.number}
                    onChange={(e) => updateMethod(i, 'number', e.target.value)}
                    className="input-field !py-2 text-sm font-mono"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>

              {/* Row 3: Instructions */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Instructions (shown to customer)
                </label>
                <input
                  value={method.instructions || ''}
                  onChange={(e) => updateMethod(i, 'instructions', e.target.value)}
                  className="input-field !py-2 text-sm"
                  placeholder="e.g. Personal → Send Money → Enter number → Use order number as reference"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Product Categories ── */}
      <div className="bg-white border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-heading text-xl font-semibold">Product Categories</h2>
          <button
            onClick={addCategory}
            className="btn-secondary flex items-center space-x-1.5 !py-2 !px-4 text-sm"
          >
            <HiPlus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Manage product categories. The slug is used in URLs (lowercase, no spaces). The label is the display name.
        </p>

        {(settings.categories || []).length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6 border border-dashed border-border rounded-lg">
            No categories yet. Click &quot;Add Category&quot; to add one.
          </p>
        )}

        <div className="space-y-3">
          {(settings.categories || []).map((cat, i) => (
            <div key={i} className="flex items-center gap-3 p-3 border border-border rounded-lg">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Label (Display Name)</label>
                  <input
                    value={cat.label}
                    onChange={(e) => updateCategory(i, 'label', e.target.value)}
                    className="input-field !py-2 text-sm"
                    placeholder="e.g. Watches"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Slug (used in URL)</label>
                  <input
                    value={cat.slug}
                    onChange={(e) => updateCategory(i, 'slug', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))}
                    className="input-field !py-2 text-sm font-mono"
                    placeholder="e.g. watches"
                  />
                </div>
              </div>
              <button
                onClick={() => removeCategory(i)}
                className="text-red-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors flex-shrink-0"
                title="Remove category"
              >
                <HiTrash className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Save */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="btn-primary flex items-center space-x-2"
        >
          <HiOutlineSave className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
