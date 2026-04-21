const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    front: { type: String, required: true },
    back: { type: String, required: true },
    status: { type: String, enum: ['review', 'known'], default: 'review' },
    updatedAt: { type: Date, default: Date.now }
}, { _id: true });

const flashcardDeckSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    cards: [cardSchema]
}, { timestamps: true });

module.exports = mongoose.model('FlashcardDeck', flashcardDeckSchema);