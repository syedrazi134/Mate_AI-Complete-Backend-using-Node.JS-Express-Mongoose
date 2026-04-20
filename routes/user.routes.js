const router  = require('express').Router();
const { body } = require('express-validator');

const { getProfile, updateProfile, changePassword } = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validate }    = require('../middleware/validate.middleware');

// All user routes require authentication (middleware that verify token each before visiting the route)
router.use(verifyToken);

// GET  /users/me
router.get('/me', getProfile);

// PUT  /users/me
router.put('/me',
  [
    body('name').optional().trim().isLength({ max: 80 }).withMessage('Name too long.'),
    body('avatarUrl').optional().isURL().withMessage('avatarUrl must be a valid URL.')
  ],
  validate,
  updateProfile
);

// PUT  /users/me/password
router.put('/me/password',
  [
    body('currentPassword').notEmpty().withMessage('currentPassword is required.'),
    body('newPassword').isLength({ min: 8 }).withMessage('newPassword must be at least 8 characters.')
  ],
  validate,
  changePassword
);

module.exports = router;
