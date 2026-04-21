const router  = require('express').Router();
const { body } = require('express-validator');

const { generateDeck, updateCardReview } = require('../controllers/flashcard.controller');
const { verifyToken, verifyOwner }       = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

// middleware
router.use(verifyToken);

// POST /flashcards/generate
router.post('/generate',
  [
    body('subjectId').notEmpty().withMessage('subjectId is required.'),
    body('cardCount').optional().isInt({ min: 1, max: 50 }).withMessage('cardCount must be 1–50.')
  ],
  validate,
  generateDeck
);

// PATCH /flashcards/:deckId/cards/:cardId/review
router.patch('/:deckId/cards/:cardId/review',
  verifyOwner('FlashcardDeck', 'deckId'),
  [body('status').isIn(['known','review']).withMessage('status must be "known" or "review".')],
  validate,
  updateCardReview
);

module.exports = router;
