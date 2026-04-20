const User = require('../models/User.model');
const { AppError } = require('../middleware/errorHandler');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.utils');

// ### Register ################################################################
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return next(new AppError('Email already registered.', 409, 'EMAIL_CONFLICT'));
    }

    const user = await User.create({ name, email, password });

    const payload = { userId: user._id.toString(), email: user.email };
    const accessToken  = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token: accessToken,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    next(err);
  }
};

// ### Login ###########################################################################
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('Invalid credentials.', 401, 'INVALID_CREDENTIALS'));
    }

    // Google-only account trying email login
    if (user.provider === 'google') {
      return next(new AppError('This account uses Google login.', 409, 'USE_OAUTH'));
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return next(new AppError('Invalid credentials.', 401, 'INVALID_CREDENTIALS'));
    }

    const payload = { userId: user._id.toString(), email: user.email };
    const accessToken  = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    next(err);
  }
};

// ### Refresh Token #######################################################
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return next(new AppError('Refresh token missing.', 400, 'TOKEN_MISSING'));
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return next(new AppError('Refresh token expired or invalid.', 401, 'INVALID_REFRESH_TOKEN'));
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      // Possible token reuse — revoke all tokens
      if (user) { user.refreshTokens = []; await user.save(); }
      return next(new AppError('Refresh token revoked.', 403, 'TOKEN_REVOKED'));
    }

    // Rotate: remove old, issue new
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    const payload         = { userId: user._id.toString(), email: user.email };
    const newAccessToken  = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
};

// ### Logout #################################################################
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return next(new AppError('Refresh token required.', 400, 'TOKEN_MISSING'));
    }

    const user = await User.findById(req.user.userId);
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
      await user.save();
    }

    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, logout };
