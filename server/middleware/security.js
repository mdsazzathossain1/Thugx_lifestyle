const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

/**
 * SECURITY MIDDLEWARE MODULE
 * Provides rate limiting, input validation, and security headers
 */

// ─── RATE LIMITERS ────────────────────────────────────────────────────────
/**
 * General rate limiter - 100 requests per 15 minutes
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retrySecs = req.rateLimit?.resetTime
      ? Math.max(1, Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000))
      : 900;
    console.warn(`[rate-limit:general] blocked — ip=${req.ip} route=${req.originalUrl} retryAfter=${retrySecs}s time=${new Date().toISOString()}`);
    res.set('Retry-After', String(retrySecs));
    return res.status(429).json({
      message: 'Too many requests. Please slow down and try again later.',
      retryAfter: retrySecs,
    });
  },
  skip: (req) => process.env.NODE_ENV === 'development',
});

/**
 * Auth rate limiter - Stricter limits for login/register/password reset
 * 5 attempts per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retrySecs = req.rateLimit?.resetTime
      ? Math.max(1, Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000))
      : 900;
    console.warn(`[rate-limit:auth] blocked — ip=${req.ip} route=${req.originalUrl} retryAfter=${retrySecs}s time=${new Date().toISOString()}`);
    res.set('Retry-After', String(retrySecs));
    return res.status(429).json({
      message: 'Too many authentication attempts. Please wait before trying again.',
      retryAfter: retrySecs,
    });
  },
  skip: (req) => process.env.NODE_ENV === 'development',
});

/**
 * Password reset limiter - 3 attempts per hour per IP
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retrySecs = req.rateLimit?.resetTime
      ? Math.max(1, Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000))
      : 3600;
    console.warn(`[rate-limit:password-reset] blocked — ip=${req.ip} route=${req.originalUrl} retryAfter=${retrySecs}s time=${new Date().toISOString()}`);
    res.set('Retry-After', String(retrySecs));
    return res.status(429).json({
      message: 'Too many password reset attempts. Please wait before trying again.',
      retryAfter: retrySecs,
    });
  },
  skip: (req) => process.env.NODE_ENV === 'development',
});

/**
 * API limiter - Standard API rate limiting
 * 1000 requests per hour
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retrySecs = req.rateLimit?.resetTime
      ? Math.max(1, Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000))
      : 3600;
    console.warn(`[rate-limit:api] blocked — ip=${req.ip} route=${req.originalUrl} retryAfter=${retrySecs}s time=${new Date().toISOString()}`);
    res.set('Retry-After', String(retrySecs));
    return res.status(429).json({
      message: 'Too many requests. Please try again later.',
      retryAfter: retrySecs,
    });
  },
  skip: (req) => process.env.NODE_ENV === 'development',
});

// ─── INPUT VALIDATION & SANITIZATION ──────────────────────────────────────
/**
 * Sanitize and validate email
 */
const validateEmail = body('email')
  .trim()
  .toLowerCase()
  .isEmail()
  .withMessage('Invalid email format')
  .normalizeEmail();

/**
 * Sanitize and validate password
 */
const validatePassword = body('password')
  .trim()
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  .withMessage('Password must contain uppercase, lowercase, number, and special character (@$!%*?&)');

/**
 * Sanitize and validate name
 */
const validateName = body('name')
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage('Name must be between 2 and 50 characters')
  .matches(/^[a-zA-Z\s'-]*$/)
  .withMessage('Name contains invalid characters');

/**
 * Sanitize and validate phone
 */
const validatePhone = body('phone')
  .optional()
  .trim()
  .matches(/^[\d+\-().\s]+$/)
  .withMessage('Invalid phone format');

/**
 * XSS Protection - Sanitize input to remove potential XSS
 */
const sanitizeInput = (req, res, next) => {
  // Check for common XSS patterns and reject
  const xssPatterns = [/<script/i, /javascript:/i, /onerror=/i, /onclick=/i];

  const checkValue = (value) => {
    if (typeof value === 'string') {
      return xssPatterns.some((pattern) => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some((v) => checkValue(v));
    }
    return false;
  };

  if (checkValue(req.body) || checkValue(req.query) || checkValue(req.params)) {
    return res.status(400).json({ message: 'Invalid input detected' });
  }

  next();
};

/**
 * SQL Injection Protection - Check for common SQL patterns
 */
const preventSQLInjection = (req, res, next) => {
  const sqlPatterns = [
    /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|SCRIPT)\b)/i,
    /(-{2}|\/\*|\*\/|;)/,
  ];

  const checkValue = (value) => {
    if (typeof value === 'string') {
      return sqlPatterns.some((pattern) => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some((v) => checkValue(v));
    }
    return false;
  };

  if (checkValue(req.body) || checkValue(req.query)) {
    return res.status(400).json({ message: 'Invalid input detected' });
  }

  next();
};

/**
 * Validation error handler
 * Checks for validation errors from express-validator
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * CORS Configuration
 * Restricts API access to allowed origins only
 */
const getCorsOptions = () => {
  const allowedOrigins = [
    // Local development
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    // Production URLs - from environment variables
    process.env.FRONTEND_URL,
    process.env.CLIENT_URL,
    // Additional allowed origins
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((url) => url.trim()) : []),
    // Only allow the specific project domain, not all *.vercel.app
    'https://thugx-lifestyle.vercel.app',
  ].filter(Boolean);

  return {
    origin: (origin, callback) => {
      if (!origin) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        callback(null, true);
      } else if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('CORS not allowed'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600, // 1 hour
  };
};

/**
 * MongoDB Operator Injection Prevention
 * Strips keys starting with '$' or containing '.' from req.body, req.query, req.params
 * Prevents attacks like { "email": { "$gt": "" } } bypassing auth
 */
const preventMongoInjection = (req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      for (const key of Object.keys(obj)) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      }
    }
    return obj;
  };
  if (req.body)  sanitize(req.body);
  if (req.query) sanitize(req.query);
  next();
};

/**
 * Security Headers Middleware
 * Add additional security headers beyond Helmet
 */
const securityHeaders = (req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection in older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Clickjacking protection
  res.setHeader('X-Frame-Options', 'DENY');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Feature policy / Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
};

/**
 * Helmet Security Options Configuration
 */
const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https:'],
      fontSrc: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
};

module.exports = {
  // Rate limiters
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  apiLimiter,

  // Input validation
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  handleValidationErrors,

  // Security
  sanitizeInput,
  preventSQLInjection,
  preventMongoInjection,
  securityHeaders,

  // CORS & Helmet options
  getCorsOptions,
  helmetOptions,
};
