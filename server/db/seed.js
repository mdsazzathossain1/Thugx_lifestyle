/**
 * Seeds local JSON store with admin user and sample products.
 * Run automatically on server start if data is missing.
 */
const { Admin, Product, Settings } = require('./models');

const sampleProducts = [
  {
    name: 'Chronograph Elite',
    category: 'watches',
    description: 'A premium chronograph timepiece crafted with precision. Features a stainless steel case, sapphire crystal glass, and genuine leather strap. Water resistant to 100 meters.',
    price: 45000,
    discountPrice: 39999,
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800', altText: 'Chronograph Elite Watch', order: 0 }],
    specifications: [
      { key: 'Case Material', value: 'Stainless Steel' },
      { key: 'Band Material', value: 'Genuine Leather' },
      { key: 'Water Resistance', value: '100m' },
      { key: 'Movement', value: 'Japanese Quartz' },
    ],
    stock: 15,
    isActive: true,
    featured: true,
  },
  {
    name: 'Midnight Black Automatic',
    category: 'watches',
    description: 'An automatic mechanical watch with a sleek all-black design. The skeleton dial reveals the intricate movement within. A statement piece for the modern gentleman.',
    price: 85000,
    discountPrice: 74999,
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=800', altText: 'Midnight Black Automatic Watch', order: 0 }],
    specifications: [
      { key: 'Case Material', value: 'Black PVD Steel' },
      { key: 'Band Material', value: 'Rubber' },
      { key: 'Water Resistance', value: '50m' },
      { key: 'Movement', value: 'Automatic Mechanical' },
    ],
    stock: 8,
    isActive: true,
    featured: true,
  },
  {
    name: 'Aviator Classic',
    category: 'sunglasses',
    description: 'Timeless aviator-style sunglasses with gold-frame and gradient lenses. UV400 protection for all-day outdoor wear.',
    price: 12000,
    discountPrice: 9999,
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800', altText: 'Aviator Classic Sunglasses', order: 0 }],
    specifications: [
      { key: 'Frame Material', value: 'Metal Alloy' },
      { key: 'Lens Material', value: 'Polycarbonate' },
      { key: 'UV Protection', value: 'UV400' },
      { key: 'Style', value: 'Aviator' },
    ],
    stock: 30,
    isActive: true,
    featured: true,
  },
  {
    name: 'Urban Shield',
    category: 'sunglasses',
    description: 'Bold wraparound sunglasses built for urban explorers. Polarized lenses reduce glare on city streets.',
    price: 15000,
    discountPrice: 12999,
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800', altText: 'Urban Shield Sunglasses', order: 0 }],
    specifications: [
      { key: 'Frame Material', value: 'TR-90 Nylon' },
      { key: 'Lens Material', value: 'Polarized Glass' },
      { key: 'UV Protection', value: 'UV400' },
      { key: 'Style', value: 'Wraparound' },
    ],
    stock: 20,
    isActive: true,
    featured: false,
  },
  {
    name: 'Royal Gold Dress Watch',
    category: 'watches',
    description: 'Elegant dress watch with a gold-plated case and a white dial. Perfect for formal occasions and business environments.',
    price: 32000,
    discountPrice: null,
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800', altText: 'Royal Gold Dress Watch', order: 0 }],
    specifications: [
      { key: 'Case Material', value: 'Gold-Plated Steel' },
      { key: 'Band Material', value: 'Crocodile Leather' },
      { key: 'Water Resistance', value: '30m' },
      { key: 'Movement', value: 'Swiss Quartz' },
    ],
    stock: 5,
    isActive: true,
    featured: false,
  },
];

async function seedLocalStore() {
  try {
    // Seed admin
    const existingAdmin = await Admin.findOne({ email: 'admin@thugxlifestyle.com' });
    if (!existingAdmin) {
      await Admin.create({
        username: 'admin',
        email: 'admin@thugxlifestyle.com',
        password: 'Admin@123',
        role: 'super_admin',
      });
      console.log('✅ Default admin created: admin@thugxlifestyle.com / Admin@123');
    }

    // Seed products
    const count = await Product.countDocuments();
    if (count === 0) {
      for (const p of sampleProducts) {
        await Product.create(p);
      }
      console.log(`\u2705 ${sampleProducts.length} sample products seeded`);
    }

    // Seed default settings
    const existing = await Settings.get();
    if (!existing) {
      await Settings.upsert({
        deliveryCharges: { insideDhaka: 60, outsideDhaka: 120 },
        paymentMethods: [
          { name: 'bKash', number: '01610796167', instructions: 'Personal → Send Money → Enter number → Use order number as reference', isActive: true },
          { name: 'Nagad', number: '01610796167', instructions: 'Send Money → Enter number → Use order number as reference', isActive: true },
          { name: 'Rocket', number: '01610796167', instructions: 'Send Money → Enter number → Use order number as reference', isActive: true },
        ],
        categories: [
          { slug: 'watches', label: 'Watches' },
          { slug: 'sunglasses', label: 'Sunglasses' },
        ],
        codEnabled: true,
      });
      console.log('✅ Default settings seeded (delivery charges + payment methods + categories)');
    } else if (!existing.categories || existing.categories.length === 0) {
      // Migrate existing settings to add default categories
      await Settings.upsert({ ...existing, categories: [
        { slug: 'watches', label: 'Watches' },
        { slug: 'sunglasses', label: 'Sunglasses' },
      ]});
      console.log('✅ Categories migrated to existing settings');
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}

module.exports = seedLocalStore;
