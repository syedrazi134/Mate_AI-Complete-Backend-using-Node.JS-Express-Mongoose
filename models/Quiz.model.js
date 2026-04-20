const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    type: { type: String, enum: ['mcq', 'true_false', 'short_answer'], required: true },
    question: { type: String, required: true },
    options: [String],          // null / empty for short_answer
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: '' }
}, { _id: true });

const quizSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    title: { type: String, default: 'Quiz', maxlength: 200 },
    questions: [questionSchema],
    submitted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);