const FlashcardDeck = require('../models/Flashcard.model');
const Subject       = require('../models/Subject.model');
const Note          = require('../models/Note.model');
const { AppError }  = require('../middleware/errorHandler');

// ── POST /flashcards/generate ########################################################
const generateDeck = async (req, res, next) => {
  try {
    const { subjectId, cardCount = 15 } = req.body;

    if (cardCount < 1 || cardCount > 50) {
      return next(new AppError('cardCount must be between 1 and 50.', 400, 'VALIDATION_ERROR'));
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) return next(new AppError('Subject not found.', 404, 'NOT_FOUND'));
    if (subject.userId.toString() !== req.user.userId) {
      return next(new AppError('Access forbidden.', 403, 'FORBIDDEN'));
    }

    const readyNotes = await Note.find({ subjectId, status: 'ready' });
    if (readyNotes.length === 0) {
      return next(new AppError('No ready notes available to generate flashcards from.', 422, 'NO_CONTENT'));
    }

    // ── AI call placeholder ########################################################
    // const cards = await callAI_generateFlashcards(readyNotes, cardCount);
    const cards = Array.from({ length: cardCount }, (_, i) => ({
      front: `Term ${i + 1}`,
      back:  `Definition ${i + 1}`
    }));

    const deck = await FlashcardDeck.create({ userId: req.user.userId, subjectId, cards });

    res.status(201).json({
      deckId: deck._id,
      cards:  deck.cards.map(c => ({ id: c._id, front: c.front, back: c.back }))
    });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /flashcards/:cardId/review ##########################################
// Note: cardId refers to a card's subdocument _id; we store deckId in params too
// Route: PATCH /flashcards/:deckId/cards/:cardId/review  (see routes file)
const updateCardReview = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['known', 'review'].includes(status)) {
      return next(new AppError('Status must be "known" or "review".', 400, 'VALIDATION_ERROR'));
    }

    const deck   = req.resource;    // verified deck ownership
    const cardId = req.params.cardId;
    const card   = deck.cards.id(cardId);
    if (!card) return next(new AppError('Card not found.', 404, 'NOT_FOUND'));

    card.status    = status;
    card.updatedAt = new Date();
    await deck.save();

    res.status(200).json({ cardId: card._id, status: card.status, updatedAt: card.updatedAt });
  } catch (err) {
    next(err);
  }
};

module.exports = { generateDeck, updateCardReview };
