// Mock database for development when MongoDB is unavailable
const mockAdmins = [
  {
    _id: '1',
    username: 'admin',
    email: 'admin@thugxlifestyle.com',
    password: '$2a$12$IV8P/ZvWBATz3RQvXVSMQO1S3XVBsvVPxXVxn/9w3C5kK7Z6Y8q2e', // Admin@123 hashed
    role: 'super_admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockProducts = [
  {
    _id: '1',
    name: 'Chronograph Elite',
    category: 'watches',
    description: 'A premium chronograph timepiece crafted with precision. Features a stainless steel case, sapphire crystal glass, and genuine leather strap.',
    price: 45000,
    discountPrice: 39999,
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800', altText: 'Chronograph Elite Watch', order: 0 }],
    stock: 15,
    isActive: true,
    featured: true,
  },
];

const mockUsers = [];
const mockOrders = [];

module.exports = {
  mockAdmins,
  mockProducts,
  mockUsers,
  mockOrders,
};
