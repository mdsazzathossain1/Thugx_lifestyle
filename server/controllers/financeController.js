const dbModels = require('../db/models');
const Finance = dbModels.Finance;

if (!Finance) {
  // If mongoose models are used in a different path, try fallback
  try { Finance = require('../models/Finance'); } catch (e) {}
}

// Create finance item (type: 'cost' | 'revenue')
const createFinanceItem = async (req, res) => {
  try {
    const { type, amount, category = 'general', date, notes, partner, source, reason, orderId, productId, userId } = req.body;
    if (!type || !['cost', 'revenue'].includes(type)) return res.status(400).json({ message: 'Type must be cost or revenue' });
    if (typeof amount !== 'number' && typeof amount !== 'string') return res.status(400).json({ message: 'Amount is required' });
    const parsedAmount = Number(amount) || 0;
    const item = await Finance.create({
      type,
      amount: parsedAmount,
      category,
      date: date || new Date().toISOString(),
      notes: notes || '',
      partner: partner || null,
      source: source || null,
      reason: reason || null,
      orderId: orderId || null,
      productId: productId || null,
      userId: userId || null,
      createdBy: req.admin?.username || 'admin',
    });
    res.status(201).json({ message: 'Finance item created', item });
  } catch (err) {
    console.error('Create finance error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateFinanceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    if (update.amount) update.amount = Number(update.amount);
    const item = await Finance.findByIdAndUpdate(id, update, { new: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Updated', item });
  } catch (err) {
    console.error('Update finance error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteFinanceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Finance.findByIdAndDelete(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Deleted', item });
  } catch (err) {
    console.error('Delete finance error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const listFinanceItems = async (req, res) => {
  try {
    const { type, from, to, category } = req.query;
    const q = {};
    if (type) q.type = type;
    if (category) q.category = category;
    if (from || to) q.date = {};
    if (from) q.date['$gte'] = new Date(from);
    if (to) q.date['$lte'] = new Date(to);
    const items = await Finance.find(q).sort({ date: -1 });
    res.json({ items });
  } catch (err) {
    console.error('List finance error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const financeSummary = async (req, res) => {
  try {
    // summary for given period (optional): from/to
    const { from, to } = req.query;
    const match = {};
    if (from || to) match.date = {};
    if (from) match.date['$gte'] = new Date(from);
    if (to) match.date['$lte'] = new Date(to);

    const group = [
      { $match: match },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ];

    const agg = await Finance.aggregate(group);
    const totals = { cost: 0, revenue: 0 };
    for (const r of agg) {
      totals[r._id] = r.total || 0;
    }
    const net = (totals.revenue || 0) - (totals.cost || 0);
    res.json({ totals, net });
  } catch (err) {
    console.error('Finance summary error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Summary by partner
const summaryByPartner = async (req, res) => {
  try {
    const { from, to } = req.query;
    const match = {};
    if (from || to) match.date = {};
    if (from) match.date['$gte'] = new Date(from);
    if (to) match.date['$lte'] = new Date(to);

    const agg = await Finance.aggregate([
      { $match: match },
      { $group: { _id: '$partner', cost: { $sum: { $cond: [{ $eq: ['$type', 'cost'] }, '$amount', 0] } }, revenue: { $sum: { $cond: [{ $eq: ['$type', 'revenue'] }, '$amount', 0] } } } },
    ]);
    res.json({ partners: agg });
  } catch (err) {
    console.error('summaryByPartner error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Summary by product (revenues and costs linked to productId)
const summaryByProduct = async (req, res) => {
  try {
    const agg = await Finance.aggregate([
      { $group: { _id: '$productId', total: { $sum: '$amount' }, types: { $push: '$type' } } },
    ]);
    res.json({ products: agg });
  } catch (err) {
    console.error('summaryByProduct error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Time series totals (daily) for charting
const timeSeries = async (req, res) => {
  try {
    const { from, to } = req.query;
    const match = {};
    if (from || to) match.date = {};
    if (from) match.date['$gte'] = new Date(from);
    if (to) match.date['$lte'] = new Date(to);

    // group by date (YYYY-MM-DD)
    const agg = await Finance.aggregate([
      { $match: match },
      { $group: { _id: { $substr: ['$date', 0, 10] }, revenue: { $sum: { $cond: [{ $eq: ['$type', 'revenue'] }, '$amount', 0] } }, cost: { $sum: { $cond: [{ $eq: ['$type', 'cost'] }, '$amount', 0] } } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({ series: agg });
  } catch (err) {
    console.error('timeSeries error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Comprehensive Dashboard Endpoint ─────────────────────────────────────
const getFinanceDashboard = async (req, res) => {
  try {
    const { from, to } = req.query;
    const match = {};
    if (from || to) {
      match.date = {};
      if (from) match.date['$gte'] = new Date(from);
      if (to)   match.date['$lte'] = new Date(to);
    }

    // ── 1. KPI totals ──
    const kpiAgg = await Finance.aggregate([
      { $match: match },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const totals = { cost: 0, revenue: 0, costCount: 0, revenueCount: 0 };
    for (const r of kpiAgg) {
      totals[r._id]            = r.total || 0;
      totals[r._id + 'Count']  = r.count || 0;
    }
    const net           = totals.revenue - totals.cost;
    const profitMargin  = totals.revenue > 0 ? ((net / totals.revenue) * 100).toFixed(1) : '0.0';
    const roi           = totals.cost    > 0 ? ((net / totals.cost) * 100).toFixed(1)    : '0.0';

    // ── 2. Partner investment & contribution breakdown ──
    const partnerAgg = await Finance.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $ifNull: ['$partner', 'Unassigned'] },
          invested:  { $sum: { $cond: [{ $eq: ['$type', 'cost'] },    '$amount', 0] } },
          revenue:   { $sum: { $cond: [{ $eq: ['$type', 'revenue'] }, '$amount', 0] } },
          txCount:   { $sum: 1 },
          categories: { $addToSet: '$category' },
        },
      },
      { $sort: { invested: -1 } },
    ]);
    const totalInvested = partnerAgg.reduce((s, p) => s + (p.invested || 0), 0) || 1;
    const partners = partnerAgg.map(p => ({
      name:        p._id,
      invested:    p.invested,
      revenue:     p.revenue,
      share:       +((p.invested / totalInvested) * 100).toFixed(1),
      net:         p.revenue - p.invested,
      txCount:     p.txCount,
      categories:  p.categories.filter(Boolean),
    }));

    // ── 3. Cost breakdown by category ──
    const catAgg = await Finance.aggregate([
      { $match: { ...match, type: 'cost' } },
      { $group: { _id: { $ifNull: ['$category', 'general'] }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);
    const costByCategory = catAgg.map(c => ({ category: c._id, total: c.total, count: c.count }));

    // ── 4. Revenue breakdown by category ──
    const revCatAgg = await Finance.aggregate([
      { $match: { ...match, type: 'revenue' } },
      { $group: { _id: { $ifNull: ['$category', 'general'] }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);
    const revenueByCategory = revCatAgg.map(c => ({ category: c._id, total: c.total, count: c.count }));

    // ── 5. Monthly time series (last 12 months) ──
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);
    const monthlyAgg = await Finance.aggregate([
      { $match: { date: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          revenue: { $sum: { $cond: [{ $eq: ['$type', 'revenue'] }, '$amount', 0] } },
          cost:    { $sum: { $cond: [{ $eq: ['$type', 'cost'] },    '$amount', 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const monthly = monthlyAgg.map(m => ({
      month:   m._id,
      revenue: m.revenue,
      cost:    m.cost,
      net:     m.revenue - m.cost,
    }));

    // ── 6. Recent revenue transactions (last 30) ──
    const recentRevenue = await Finance.find({ ...match, type: 'revenue' })
      .sort({ date: -1 }).limit(30).lean();

    // ── 7. Recent cost transactions (last 30) ──
    const recentCosts = await Finance.find({ ...match, type: 'cost' })
      .sort({ date: -1 }).limit(30).lean();

    // ── 8. Source of funds breakdown ──
    const sourceAgg = await Finance.aggregate([
      { $match: { ...match, type: 'cost', source: { $ne: null } } },
      { $group: { _id: '$source', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    // ── 9. Partner-wise time trend (per quarter) ──
    const partnerTrendAgg = await Finance.aggregate([
      { $match: { ...match, partner: { $ne: null } } },
      {
        $group: {
          _id: {
            partner: '$partner',
            month:   { $dateToString: { format: '%Y-%m', date: '$date' } },
            type:    '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    res.json({
      kpi: { ...totals, net, profitMargin: parseFloat(profitMargin), roi: parseFloat(roi) },
      partners,
      costByCategory,
      revenueByCategory,
      monthly,
      recentRevenue,
      recentCosts,
      sourceOfFunds: sourceAgg.map(s => ({ source: s._id, total: s.total, count: s.count })),
      partnerTrend: partnerTrendAgg,
    });
  } catch (err) {
    console.error('Finance dashboard error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createFinanceItem,
  updateFinanceItem,
  deleteFinanceItem,
  listFinanceItems,
  financeSummary,
  summaryByPartner,
  summaryByProduct,
  timeSeries,
  getFinanceDashboard,
};