const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'image', 'text'], required: true },
    status: { type: String, enum: ['processing', 'ready', 'failed'], default: 'processing' },
    extractedText: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);