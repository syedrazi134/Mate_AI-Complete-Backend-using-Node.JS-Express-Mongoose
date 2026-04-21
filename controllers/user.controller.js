const User = require('../models/User.model');
const { AppError } = require('../middleware/errorHandler');
const bcrypt = require('bcryptjs');

// ── GET /users/me ########################################################
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -refreshTokens');
    if (!user) return next(new AppError('User not found.', 404, 'NOT_FOUND'));

    res.status(200).json({
      id:        user._id,
      name:      user.name,
      email:     user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      stats:     user.stats
    });
  } catch (err) {
    next(err);
  }
};

// ── PUT /users/me ########################################################
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatarUrl } = req.body;
    const updates = {};
    if (name)      updates.name      = name;
    if (avatarUrl) updates.avatarUrl = avatarUrl;

    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true })
      .select('_id name avatarUrl');

    res.status(200).json({
      success: true,
      message: 'Profile updated.',
      user: { id: user._id, name: user.name, avatarUrl: user.avatarUrl }
    });
  } catch (err) {
    next(err);
  }
};

// ── PUT /users/me/password ########################################################
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);
    const match = await user.comparePassword(currentPassword);
    if (!match) {
      return next(new AppError('Current password is incorrect.', 401, 'INVALID_CREDENTIALS'));
    }

    user.password      = newPassword;   // pre-save hook hashes it
    user.refreshTokens = [];            // revoke all sessions
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed. Please log in again.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, changePassword };
