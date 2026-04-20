const Note        = require('../models/Note.model');
const Quiz        = require('../models/Quiz.model');
const FlashcardDeck = require('../models/Flashcard.model');
const { AppError }  = require('../middleware/errorHandler');

// ── GET /search?q=&type=&subjectId= ########################################################
const searchContent = async (req, res, next) => {
  try {
    const { q, type = 'all', subjectId } = req.query;

    if (!q || !q.trim()) {
      return next(new AppError('Query parameter "q" is required.', 400, 'VALIDATION_ERROR'));
    }

    const userId = req.user.userId;
    const regex  = new RegExp(q.trim(), 'i');
    const baseFilter = subjectId ? { userId, subjectId } : { userId };

    const results = { notes: [], quizzes: [], flashcards: [] };

    if (type === 'all' || type === 'notes') {
      const notes = await Note.find({ ...baseFilter, title: regex }).select('_id title extractedText');
      results.notes = notes.map(n => ({
        id: n._id, title: n.title,
        excerpt: n.extractedText ? n.extractedText.substring(0, 200) + '...' : ''
      }));
    }

    if (type === 'all' || type === 'quizzes') {
      const quizzes = await Quiz.find({ ...baseFilter, title: regex }).select('_id title');
      results.quizzes = quizzes.map(q => ({ id: q._id, title: q.title }));
    }

    if (type === 'all' || type === 'flashcards') {
      const decks = await FlashcardDeck.find(baseFilter);
      const matched = [];
      decks.forEach(deck => {
        deck.cards.forEach(card => {
          if (regex.test(card.front) || regex.test(card.back)) {
            matched.push({ id: card._id, front: card.front, back: card.back });
          }
        });
      });
      results.flashcards = matched;
    }

    const totalCount = results.notes.length + results.quizzes.length + results.flashcards.length;

    res.status(200).json({ results, totalCount });
  } catch (err) {
    next(err);
  }
};

module.exports = { searchContent };
