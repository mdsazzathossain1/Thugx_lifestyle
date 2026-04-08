const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => e.message);
      return res.status(400).json({ message: 'Validation error', errors: messages });
    }
    next(error);
  }
};

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  phone: z.string().min(1, 'Phone is required'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required').max(5000),
  price: z.number().min(0, 'Price must be positive'),
  discountPrice: z.number().min(0).nullable().optional(),
  stock: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  featured: z.boolean().optional(),
  specifications: z.array(z.object({
    key: z.string().min(1),
    value: z.string().min(1),
  })).optional(),
});

const orderSchema = z.object({
  customer: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().min(1, 'Phone is required'),
    address: z.object({
      street: z.string().min(1, 'Street is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    }),
  }),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1),
  })).min(1, 'At least one item is required'),
});

const paymentSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  productSchema,
  orderSchema,
  paymentSchema,
};
