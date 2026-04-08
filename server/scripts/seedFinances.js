const axios = require('axios');
const token = process.env.ADMIN_TOKEN;
const api = axios.create({ baseURL: 'http://localhost:5000/api', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });

(async () => {
  try {
    const items = [
      { type: 'cost', amount: 500, category: 'manufacturing', partner: 'Partner A', reason: 'Initial inventory' },
      { type: 'revenue', amount: 1200, category: 'online-sale', partner: 'Partner A', orderId: 'ORD123', productId: 'prod_1' },
      { type: 'revenue', amount: 800, category: 'wholesale', partner: 'Partner B', orderId: 'ORD124', productId: 'prod_2' },
    ];
    for (const it of items) {
      const res = await api.post('/admin/finances', it);
      console.log('Created:', res.data.item?._id || res.data);
    }
    const list = await api.get('/admin/finances');
    console.log('List count:', list.data.items.length);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
    process.exit(1);
  }
})();
