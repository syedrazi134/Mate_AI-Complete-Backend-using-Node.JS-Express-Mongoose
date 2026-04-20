const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    color: { type: String, default: '#3498DB', match: /^#[0-9A-Fa-f]{6}$/ }
}, { timestamps: true });

// Unique subject name per user
subjectSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);