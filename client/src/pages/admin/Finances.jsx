import { useEffect, useState } from 'react';
import { adminApi } from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatPrice } from '../../utils/helpers';
import PartnerShareChart from '../../components/admin/PartnerShareChart';
import TimeSeriesChart from '../../components/admin/TimeSeriesChart';

const FinanceForm = ({ onSaved, initial }) => {
  const [type, setType] = useState(initial?.type || 'cost');
  const [amount, setAmount] = useState(initial?.amount || '');
  const [category, setCategory] = useState(initial?.category || 'general');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (initial && initial._id) {
        await adminApi.put(`/api/admin/finances/${initial._id}`, { type, amount: Number(amount), category, notes });
      } else {
        await adminApi.post('/api/admin/finances', { type, amount: Number(amount), category, notes });
      }
      onSaved();
    } catch (err) {
      console.error(err);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white border border-border rounded-lg p-4">
      <div className="grid grid-cols-2 gap-3">
        <select value={type} onChange={(e) => setType(e.target.value)} className="input-field">
          <option value="cost">Cost</option>
          <option value="revenue">Revenue</option>
        </select>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" className="input-field" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="input-field" />
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" className="input-field" />
      </div>
      <div className="mt-3 flex gap-2">
        <button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        <button type="button" onClick={() => onSaved(true)} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
};

const Finances = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [summary, setSummary] = useState({ totals: { cost: 0, revenue: 0 }, net: 0 });
  const [partnerData, setPartnerData] = useState([]);
  const [seriesData, setSeriesData] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/api/admin/finances');
      setItems(res.data.items || []);
      const s = await adminApi.get('/api/admin/finances/summary');
      setSummary(s.data || { totals: { cost: 0, revenue: 0 }, net: 0 });
      // partner summary for chart
      try {
        const p = await adminApi.get('/api/admin/finances/summary/partners');
        // normalize partner entries into { _id, revenue, cost }
        setPartnerData((p.data && p.data.partners) ? p.data.partners.map(pt => ({ _id: pt._id || 'Unknown', revenue: pt.revenue || 0, cost: pt.cost || 0 })) : []);
      } catch (err) { console.warn('Failed fetching partner summary', err); }
      // time series
      try {
        const t = await adminApi.get('/api/admin/finances/summary/timeseries');
        setSeriesData(t.data.series || []);
      } catch (err) { console.warn('Failed fetching timeseries', err); }
    } catch (err) {
      console.error(err);
      alert('Failed to load finances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const remove = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await adminApi.delete(`/api/admin/finances/${id}`);
      fetchData();
    } catch (err) { console.error(err); alert('Delete failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-2xl font-bold">Finance / Costs & Revenues</h1>
        <div className="flex gap-3">
          <div className="bg-white border border-border rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-lg font-bold text-green-600">{formatPrice(summary.totals.revenue || 0)}</p>
          </div>
          <div className="bg-white border border-border rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">Total Costs</p>
            <p className="text-lg font-bold text-red-600">{formatPrice(summary.totals.cost || 0)}</p>
          </div>
          <div className="bg-white border border-border rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">Net</p>
            <p className="text-lg font-bold">{formatPrice(summary.net || 0)}</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <button onClick={() => { setShowForm(true); setEditing(null); }} className="btn-primary">Add Cost / Revenue</button>
      </div>

      {showForm && (
        <div className="mb-4">
          <FinanceForm onSaved={() => { setShowForm(false); fetchData(); }} initial={editing} />
          </div>
        )}

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="col-span-2 bg-white border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Revenue / Cost Over Time</h3>
              <TimeSeriesChart series={seriesData} />
            </div>
            <div className="bg-white border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Partner Revenue Share</h3>
              <PartnerShareChart data={partnerData} />
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <table className="w-full">
            <thead className="bg-light">
              <tr>
                <th className="text-left px-4 py-2 text-xs text-gray-500">Type</th>
                <th className="text-left px-4 py-2 text-xs text-gray-500">Amount</th>
                <th className="text-left px-4 py-2 text-xs text-gray-500">Category</th>
                <th className="text-left px-4 py-2 text-xs text-gray-500">Notes</th>
                <th className="text-left px-4 py-2 text-xs text-gray-500">Date</th>
                <th className="text-left px-4 py-2 text-xs text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">No items</td></tr>
              ) : items.map(i => (
                <tr key={i._id}>
                  <td className="px-4 py-3">{i.type}</td>
                  <td className="px-4 py-3">{formatPrice(i.amount)}</td>
                  <td className="px-4 py-3">{i.category}</td>
                  <td className="px-4 py-3">{i.notes}</td>
                  <td className="px-4 py-3">{new Date(i.date).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setEditing(i); setShowForm(true); }} className="btn-secondary mr-2">Edit</button>
                    <button onClick={() => remove(i._id)} className="btn-danger">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
};

export default Finances;
