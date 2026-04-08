const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('../models/Admin');
const Product = require('../models/Product');

const connectDB = require('../config/db');

const seedData = async () => {
  try {
    await connectDB();

    // Create default admin
    const existingAdmin = await Admin.findOne({ email: 'admin@thugxlifestyle.com' });
    if (!existingAdmin) {
      await Admin.create({
        username: 'admin',
        email: 'admin@thugxlifestyle.com',
        password: 'Admin@123',
        role: 'super_admin',
      });
      console.log('Default admin created: admin@thugxlifestyle.com / Admin@123');
    } else {
      console.log('Admin already exists');
    }

    // Create sample products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
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
          price: 65000,
          media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', altText: 'Midnight Black Watch', order: 0 }],
          specifications: [
            { key: 'Case Material', value: 'PVD Coated Steel' },
            { key: 'Band Material', value: 'Stainless Steel Mesh' },
            { key: 'Movement', value: 'Automatic' },
            { key: 'Dial', value: 'Skeleton' },
          ],
          stock: 8,
          isActive: true,
          featured: true,
        },
        {
          name: 'Royal Gold Classic',
          category: 'watches',
          description: 'A classic gold-tone timepiece that exudes luxury. Roman numeral markers on a cream dial, paired with a brown crocodile-embossed strap.',
          price: 55000,
          discountPrice: 49999,
          media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800', altText: 'Royal Gold Classic Watch', order: 0 }],
          specifications: [
            { key: 'Case Material', value: 'Gold-Plated Steel' },
            { key: 'Band Material', value: 'Crocodile-Embossed Leather' },
            { key: 'Water Resistance', value: '50m' },
          ],
          stock: 12,
          isActive: true,
          featured: true,
        },
        {
          name: 'Aviator Pro',
          category: 'sunglasses',
          description: 'Classic aviator sunglasses with premium polarized lenses. Gold-tone metal frame with adjustable nose pads for a comfortable fit. UV400 protection.',
          price: 18000,
          discountPrice: 14999,
          media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800', altText: 'Aviator Pro Sunglasses', order: 0 }],
          specifications: [
            { key: 'Frame Material', value: 'Metal Alloy' },
            { key: 'Lens Type', value: 'Polarized' },
            { key: 'UV Protection', value: 'UV400' },
            { key: 'Frame Color', value: 'Gold' },
          ],
          stock: 25,
          isActive: true,
          featured: true,
        },
        {
          name: 'Shadow Wayfarers',
          category: 'sunglasses',
          description: 'Bold wayfarer-style sunglasses with a matte black finish. Premium acetate frame with gradient smoke lenses. Unisex design.',
          price: 15000,
          media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800', altText: 'Shadow Wayfarer Sunglasses', order: 0 }],
          specifications: [
            { key: 'Frame Material', value: 'Premium Acetate' },
            { key: 'Lens Type', value: 'Gradient Smoke' },
            { key: 'UV Protection', value: 'UV400' },
            { key: 'Style', value: 'Wayfarer' },
          ],
          stock: 30,
          isActive: true,
          featured: true,
        },
        {
          name: 'Titanium Sport',
          category: 'watches',
          description: 'A rugged sports watch built with titanium. Features chronograph, tachymeter bezel, and luminous hands. Perfect for the active lifestyle.',
          price: 75000,
          media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=800', altText: 'Titanium Sport Watch', order: 0 }],
          specifications: [
            { key: 'Case Material', value: 'Titanium' },
            { key: 'Band Material', value: 'Rubber' },
            { key: 'Water Resistance', value: '200m' },
            { key: 'Features', value: 'Chronograph, Tachymeter' },
          ],
          stock: 6,
          isActive: true,
          featured: false,
        },
      ];

      await Product.insertMany(sampleProducts);
      console.log(`${sampleProducts.length} sample products created`);
    } else {
      console.log('Products already exist');
    }

    console.log('Seed completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
