const { Settings } = require('../db/models');

// GET /api/settings  (public)
// GET /api/admin/settings  (admin)
const getSettings = async (req, res) => {
  try {
    // upsert with no data = returns existing doc or creates one with schema defaults
    const settings = await Settings.upsert({});
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/admin/settings  (admin only)
const updateSettings = async (req, res) => {
  try {
    const { deliveryCharges, paymentMethods, codEnabled, categories } = req.body;

    const updated = await Settings.upsert({
      deliveryCharges,
      paymentMethods,
      codEnabled,
      categories,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getSettings, updateSettings };
