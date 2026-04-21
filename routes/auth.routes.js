const router  = require('express').Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');

const { register, login, refresh, logout } = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validate }    = require('../middleware/validate.middleware');

// Strict limiter for auth endpoints (brute-force protection) (GPT recommended in report that's why implemented)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, errorCode: 'RATE_LIMIT_EXCEEDED', message: 'Too many attempts. Try again in 15 minutes.' }
});

// POST auth/register
router.post('/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Must be a valid email address.').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
  ],
  validate,
  register
);

// POST /auth/login
router.post('/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Must be a valid email address.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.')
  ],
  validate,
  login
);

// POST /auth/refresh
router.post('/refresh',
  [body('refreshToken').notEmpty().withMessage('refreshToken is required.')],
  validate,
  refresh
);

// POST /auth/logout
router.post('/logout', verifyToken,
  [body('refreshToken').notEmpty().withMessage('refreshToken is required.')],
  validate,
  logout
);

module.exports = router;
