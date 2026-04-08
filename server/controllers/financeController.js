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

module.exports = {
  createFinanceItem,
  updateFinanceItem,
  deleteFinanceItem,
  listFinanceItems,
  financeSummary,
  summaryByPartner,
  summaryByProduct,
  timeSeries,
};