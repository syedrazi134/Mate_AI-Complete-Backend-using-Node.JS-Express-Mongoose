const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 8 },          // null for OAuth-only accounts
    avatarUrl: { type: String, default: null },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },

    // Refresh token store (single-use rotation)
    refreshTokens: [{ type: String }],

    stats: {
        subjectsCount: { type: Number, default: 0 },
        notesCount: { type: Number, default: 0 },
        quizzesTaken: { type: Number, default: 0 },
        flashcardsReviewed: { type: Number, default: 0 },
        currentStreak: { type: Number, default: 0 }
    }
}, { timestamps: true });

// hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.comparePassword = function (plain) {
    return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);