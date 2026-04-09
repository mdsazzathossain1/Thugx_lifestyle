import { useEffect, useState, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { adminApi } from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatPrice } from '../../utils/helpers';

const PARTNER_COLORS  = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
const CATEGORY_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#ef4444', '#8b5cf6', '#14b8a6'];

const fmt = (n) => formatPrice(n ?? 0);

const KPICard = ({ label, value, sub, color = 'text-gray-900', icon }) => (
  <div className="bg-white rounded-xl border border-border p-5 flex items-start gap-4 shadow-sm">
    {icon && <div className="text-3xl leading-none select-none">{icon}</div>}
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const SectionTitle = ({ children, sub }) => (
  <div className="mb-4">
    <h2 className="text-base font-bold text-gray-800">{children}</h2>
    {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
  </div>
);

const Badge = ({ type }) => {
  const map = { cost: 'bg-red-100 text-red-700', revenue: 'bg-green-100 text-green-700' };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[type] || 'bg-gray-100 text-gray-700'}`}>
      {type === 'cost' ? '↑ Cost' : '↓ Revenue'}
    </span>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span style={{ background: p.color, width: 8, height: 8, borderRadius: 2, display: 'inline-block' }} />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-bold">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

const PARTNERS  = ['Sazzar', 'Shassoto'];
const COST_CATS = ['product_cost','marketing','operations','logistics','platform','payroll','utilities','other'];
const REV_CATS  = ['order_sale','investment','refund_reversal','other'];

const TransactionForm = ({ onSaved, initial, onCancel }) => {
  const [type,     setType]     = useState(initial?.type     || 'cost');
  const [amount,   setAmount]   = useState(initial?.amount   || '');
  const [category, setCategory] = useState(initial?.category || '');
  const [partner,  setPartner]  = useState(initial?.partner  || '');
  const [source,   setSource]   = useState(initial?.source   || '');
  const [reason,   setReason]   = useState(initial?.reason   || '');
  const [notes,    setNotes]    = useState(initial?.notes    || '');
  const [date,     setDate]     = useState(
    initial?.date ? initial.date.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [orderId, setOrderId] = useState(initial?.orderId || '');
  const [saving,  setSaving]  = useState(false);
  const catOptions = type === 'cost' ? COST_CATS : REV_CATS;
  const field = 'w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300';

  const submit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return alert('Enter a valid amount');
    setSaving(true);
    const body = { type, amount: Number(amount), category: category||'general', partner: partner||null, source: source||null, reason: reason||null, notes, date, orderId: orderId||null };
    try {
      if (initial?._id) { await adminApi.put(`/api/admin/finances/${initial._id}`, body); }
      else              { await adminApi.post('/api/admin/finances', body); }
      onSaved();
    } catch (err) { alert('Failed: ' + (err?.response?.data?.message || err.message)); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="bg-white border border-border rounded-xl p-6 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-4">{initial?._id ? 'Edit Transaction' : 'New Transaction'}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Type *</label>
          <select value={type} onChange={e => { setType(e.target.value); setCategory(''); }} className={field}>
            <option value="cost">Cost (Expense)</option>
            <option value="revenue">Revenue (Income)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Amount (৳) *</label>
          <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 5000" className={field} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className={field} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className={field}>
            <option value="">-- Select --</option>
            {catOptions.map(c => <option key={c} value={c}>{c.replace(/_/g,' ')}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Partner</label>
          <select value={partner} onChange={e => setPartner(e.target.value)} className={field}>
            <option value="">-- None --</option>
            {PARTNERS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Source of Funds</label>
          <input value={source} onChange={e => setSource(e.target.value)} placeholder="e.g. personal savings, bank" className={field} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Reason / Description *</label>
          <input value={reason} onChange={e => setReason(e.target.value)} placeholder="What was this for?" className={field} />
        </div>
        {type === 'revenue' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Order ID (if from sale)</label>
            <input value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="Order #" className={field} />
          </div>
        )}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional details…" className={field} />
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg text-sm disabled:opacity-50">
          {saving ? 'Saving…' : initial?._id ? 'Update' : 'Add Transaction'}
        </button>
        <button type="button" onClick={onCancel} className="border border-border text-gray-600 font-semibold px-6 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
      </div>
    </form>
  );
};

const TransactionsTable = ({ items, onEdit, onDelete, loading }) => {
  const [typeFilter,     setTypeFilter]     = useState('all');
  const [partnerFilter,  setPartnerFilter]  = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const partners   = [...new Set(items.map(i => i.partner).filter(Boolean))];
  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];
  const filtered = items.filter(i => {
    if (typeFilter     !== 'all' && i.type     !== typeFilter)     return false;
    if (partnerFilter  !== 'all' && i.partner  !== partnerFilter)  return false;
    if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (i.reason||'').toLowerCase().includes(q)||(i.notes||'').toLowerCase().includes(q)||
             (i.partner||'').toLowerCase().includes(q)||(i.source||'').toLowerCase().includes(q);
    }
    return true;
  });
  const sel = 'border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300';
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-gray-50 flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold text-gray-500 mr-1">Filter:</span>
        <select value={typeFilter}     onChange={e => setTypeFilter(e.target.value)}     className={sel}><option value="all">All Types</option><option value="cost">Costs</option><option value="revenue">Revenue</option></select>
        <select value={partnerFilter}  onChange={e => setPartnerFilter(e.target.value)}  className={sel}><option value="all">All Partners</option>{partners.map(p=><option key={p} value={p}>{p}</option>)}</select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className={sel}><option value="all">All Categories</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reason / notes…" className="border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300 w-44" />
        <span className="ml-auto text-xs text-gray-400">{filtered.length} records</span>
      </div>
      {loading ? <div className="p-8 text-center"><LoadingSpinner /></div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Date</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Category</th><th className="px-4 py-3">Partner</th><th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Reason</th><th className="px-4 py-3">Order</th><th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No transactions found</td></tr>
              ) : filtered.map(i => (
                <tr key={i._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{new Date(i.date).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</td>
                  <td className="px-4 py-3"><Badge type={i.type} /></td>
                  <td className={`px-4 py-3 font-bold ${i.type==='revenue'?'text-green-600':'text-red-600'}`}>{i.type==='cost'?'-':'+'}{fmt(i.amount)}</td>
                  <td className="px-4 py-3"><span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">{(i.category||'general').replace(/_/g,' ')}</span></td>
                  <td className="px-4 py-3 text-xs">{i.partner||'—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{i.source||'—'}</td>
                  <td className="px-4 py-3 text-xs max-w-xs truncate" title={i.reason||i.notes}>{i.reason||i.notes||'—'}</td>
                  <td className="px-4 py-3 text-xs font-mono text-indigo-600">{i.orderId?`#${String(i.orderId).slice(-6)}`:'—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => onEdit(i)} className="text-xs border border-border px-2 py-1 rounded hover:bg-indigo-50 text-indigo-600">Edit</button>
                      <button onClick={() => onDelete(i._id)} className="text-xs border border-red-200 px-2 py-1 rounded hover:bg-red-50 text-red-600">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const TABS = ['Overview','Partners','Transactions','Add Entry'];

export default function Finances() {
  const [tab,       setTab]       = useState('Overview');
  const [dashboard, setDashboard] = useState(null);
  const [allItems,  setAllItems]  = useState([]);
  const [loadingDB, setLoadingDB] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);
  const [editItem,  setEditItem]  = useState(null);
  const [dateFrom,  setDateFrom]  = useState('');
  const [dateTo,    setDateTo]    = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoadingDB(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set('from', dateFrom);
      if (dateTo)   params.set('to',   dateTo);
      const res = await adminApi.get(`/api/admin/finances/dashboard?${params}`);
      setDashboard(res.data);
    } catch (err) { console.error('Dashboard fetch:', err); }
    finally { setLoadingDB(false); }
  }, [dateFrom, dateTo]);

  const fetchTransactions = useCallback(async () => {
    setLoadingTx(true);
    try {
      const res = await adminApi.get('/api/admin/finances');
      setAllItems(res.data.items || []);
    } catch (err) { console.error('Tx fetch:', err); }
    finally { setLoadingTx(false); }
  }, []);

  useEffect(() => { fetchDashboard(); },    [fetchDashboard]);
  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleSaved = () => { setEditItem(null); setTab('Transactions'); fetchDashboard(); fetchTransactions(); };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try { await adminApi.delete(`/api/admin/finances/${id}`); fetchDashboard(); fetchTransactions(); }
    catch { alert('Delete failed'); }
  };

  const kpi     = dashboard?.kpi               || {};
  const monthly = dashboard?.monthly           || [];
  const costCat = dashboard?.costByCategory    || [];
  const revCat  = dashboard?.revenueByCategory || [];
  const ptners  = dashboard?.partners          || [];

  const KpiRow = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <KPICard icon="💰" label="Total Revenue"           value={fmt(kpi.revenue)} sub={`${kpi.revenueCount??0} transactions`}    color="text-green-600" />
      <KPICard icon="💸" label="Total Investment / Cost" value={fmt(kpi.cost)}    sub={`${kpi.costCount??0} transactions`}       color="text-red-500"   />
      <KPICard icon={kpi.net>=0?'📈':'📉'} label="Net Profit / Loss" value={fmt(kpi.net)} sub={`Margin: ${kpi.profitMargin??0}%`} color={kpi.net>=0?'text-indigo-600':'text-orange-600'} />
      <KPICard icon="🔄" label="Return on Investment"   value={`${kpi.roi??0}%`} sub="(Net ÷ Cost) × 100"                       color={kpi.roi>=0?'text-emerald-600':'text-red-600'} />
    </div>
  );

  const Overview = () => (
    <div className="space-y-6">
      <KpiRow />
      <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
        <div className="mb-4"><h2 className="text-base font-bold text-gray-800">📊 Revenue vs Cost — Monthly Trend</h2><p className="text-xs text-gray-500 mt-0.5">Monthly revenue vs expenditure over the past 12 months</p></div>
        {monthly.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No data yet — add transactions to see trends</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthly} margin={{top:4,right:16,left:0,bottom:0}}>
              <defs>
                <linearGradient id="gradRev"  x1="0" y1="0" x2="0" y2="1"><stop offset="5%"  stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1"><stop offset="5%"  stopColor="#ef4444" stopOpacity={0.2}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="month" tick={{fontSize:11}}/>
              <YAxis tick={{fontSize:11}} tickFormatter={v=>`৳${(v/1000).toFixed(0)}k`}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend wrapperStyle={{fontSize:12}}/>
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" fill="url(#gradRev)"  strokeWidth={2} dot={false}/>
              <Area type="monotone" dataKey="cost"    name="Cost"    stroke="#ef4444" fill="url(#gradCost)" strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="net"     name="Net"     stroke="#6366f1" strokeWidth={2} dot={false} strokeDasharray="4 2"/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="mb-4"><h2 className="text-base font-bold text-gray-800">💸 Cost Breakdown by Category</h2><p className="text-xs text-gray-500 mt-0.5">Where money is being spent</p></div>
          {costCat.length===0 ? <p className="text-sm text-gray-400 text-center py-8">No cost data yet</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={costCat.map(c=>({name:c.category.replace(/_/g,' '),value:c.total}))} cx="40%" cy="50%" outerRadius={80} dataKey="value" nameKey="name">
                  {costCat.map((_,i)=><Cell key={i} fill={CATEGORY_COLORS[i%CATEGORY_COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v=>fmt(v)}/><Legend wrapperStyle={{fontSize:11}} layout="vertical" align="right" verticalAlign="middle"/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="mb-4"><h2 className="text-base font-bold text-gray-800">💰 Revenue Breakdown by Category</h2><p className="text-xs text-gray-500 mt-0.5">How revenue is generated</p></div>
          {revCat.length===0 ? <p className="text-sm text-gray-400 text-center py-8">No revenue data yet</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={revCat.map(c=>({name:c.category.replace(/_/g,' '),value:c.total}))} cx="40%" cy="50%" outerRadius={80} dataKey="value" nameKey="name">
                  {revCat.map((_,i)=><Cell key={i} fill={CATEGORY_COLORS[i%CATEGORY_COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v=>fmt(v)}/><Legend wrapperStyle={{fontSize:11}} layout="vertical" align="right" verticalAlign="middle"/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
        <div className="mb-4"><h2 className="text-base font-bold text-gray-800">🛒 Recent Revenue Transactions</h2><p className="text-xs text-gray-500 mt-0.5">Latest 10 revenue entries</p></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-left text-gray-500 border-b border-border"><th className="pb-2 pr-4">Date</th><th className="pb-2 pr-4">Amount</th><th className="pb-2 pr-4">Category</th><th className="pb-2 pr-4">Partner</th><th className="pb-2 pr-4">Order #</th><th className="pb-2">Reason / Notes</th></tr></thead>
            <tbody className="divide-y divide-border">
              {(dashboard?.recentRevenue||[]).slice(0,10).map(r=>(
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="py-2 pr-4 text-gray-500 whitespace-nowrap">{new Date(r.date).toLocaleDateString('en-GB',{day:'2-digit',month:'short'})}</td>
                  <td className="py-2 pr-4 font-bold text-green-600">+{fmt(r.amount)}</td>
                  <td className="py-2 pr-4"><span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded">{(r.category||'general').replace(/_/g,' ')}</span></td>
                  <td className="py-2 pr-4">{r.partner||'—'}</td>
                  <td className="py-2 pr-4 font-mono text-indigo-600">{r.orderId?`#${String(r.orderId).slice(-6)}`:'—'}</td>
                  <td className="py-2 text-gray-500 truncate max-w-xs">{r.reason||r.notes||'—'}</td>
                </tr>
              ))}
              {!(dashboard?.recentRevenue?.length)&&<tr><td colSpan={6} className="py-6 text-center text-gray-400">No revenue recorded yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const Partners = () => (
    <div className="space-y-6">
      <KpiRow />
      <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
        <div className="mb-4"><h2 className="text-base font-bold text-gray-800">🤝 Partner Investment vs Revenue</h2><p className="text-xs text-gray-500 mt-0.5">Side-by-side comparison of each partner's capital invested vs revenue attributed</p></div>
        {ptners.length===0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No partner data — tag transactions with a partner name to see this chart</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ptners.map(p=>({name:p.name,Invested:p.invested,Revenue:p.revenue,Net:p.net}))} margin={{top:4,right:16,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="name" tick={{fontSize:12}}/>
              <YAxis tick={{fontSize:11}} tickFormatter={v=>`৳${(v/1000).toFixed(0)}k`}/>
              <Tooltip content={<CustomTooltip/>}/><Legend wrapperStyle={{fontSize:12}}/>
              <Bar dataKey="Invested" fill="#6366f1" radius={[4,4,0,0]}/>
              <Bar dataKey="Revenue"  fill="#10b981" radius={[4,4,0,0]}/>
              <Bar dataKey="Net"      fill="#f59e0b" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
          <div className="mb-4"><h2 className="text-base font-bold text-gray-800">💼 Investment Share</h2><p className="text-xs text-gray-500 mt-0.5">Who contributed what % of total investment</p></div>
          {ptners.length===0 ? <p className="text-sm text-gray-400 text-center py-8">No data</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={ptners.map(p=>({name:p.name,value:p.invested}))} cx="40%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" nameKey="name"
                  label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {ptners.map((_,i)=><Cell key={i} fill={PARTNER_COLORS[i%PARTNER_COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v=>fmt(v)}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="space-y-3">
          {ptners.length===0 ? <p className="text-sm text-gray-400 text-center py-8">No partner data</p>
          : ptners.map((p,i) => (
            <div key={p.name} className="border border-border rounded-xl p-4 flex items-center gap-4" style={{borderLeftColor:PARTNER_COLORS[i%PARTNER_COLORS.length],borderLeftWidth:4}}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{background:PARTNER_COLORS[i%PARTNER_COLORS.length]}}>
                {(p.name||'?').slice(0,2).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800">{p.name}</p>
                <p className="text-xs text-gray-500">{p.share}% of total investment · {p.txCount} transactions</p>
              </div>
              <div className="text-right"><p className="text-xs text-gray-500">Invested</p><p className="font-bold text-red-500">{fmt(p.invested)}</p></div>
              <div className="text-right"><p className="text-xs text-gray-500">Net P/L</p><p className={`font-bold ${p.net>=0?'text-green-600':'text-red-500'}`}>{fmt(p.net)}</p></div>
            </div>
          ))}
          {ptners.length>0 && <p className="text-xs text-gray-400 pt-1">💡 Tag each transaction with a partner name to track individual contributions.</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Investment tracking · Revenue · Costs · Partner ledger</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300"/>
          <span className="text-xs text-gray-400">to</span>
          <input type="date" value={dateTo}   onChange={e=>setDateTo(e.target.value)}   className="border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300"/>
          <button onClick={fetchDashboard} className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-700">Apply</button>
          {(dateFrom||dateTo) && <button onClick={()=>{setDateFrom('');setDateTo('');}} className="text-xs text-gray-500 underline">Clear</button>}
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t=>(
          <button key={t} onClick={()=>{setTab(t);setEditItem(null);}}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab===t?'bg-white shadow text-indigo-700':'text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {loadingDB && tab!=='Transactions' && tab!=='Add Entry' ? (
        <div className="py-20 text-center"><LoadingSpinner /></div>
      ) : (
        <>
          {tab==='Overview'     && <Overview />}
          {tab==='Partners'     && <Partners />}
          {tab==='Transactions' && <TransactionsTable items={allItems} loading={loadingTx} onEdit={item=>{setEditItem(item);setTab('Add Entry');}} onDelete={handleDelete}/>}
          {tab==='Add Entry'    && <TransactionForm initial={editItem} onSaved={handleSaved} onCancel={()=>{setEditItem(null);setTab('Transactions');}}/>}
        </>
      )}
    </div>
  );
}
