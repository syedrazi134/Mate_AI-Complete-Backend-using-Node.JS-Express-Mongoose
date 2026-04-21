const router  = require('express').Router();
const { body } = require('express-validator');

const { generateQuiz, submitAttempt } = require('../controllers/quiz.controller');
const { verifyToken, verifyOwner }    = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

// middleware
router.use(verifyToken);

// POST /quizzes/generate
router.post('/generate',
  [
    body('subjectId').notEmpty().withMessage('subjectId is required.'),
    body('questionCount').optional().isInt({ min: 1, max: 30 }).withMessage('questionCount must be 1–30.'),
    body('difficulty').optional().isIn(['easy','medium','hard']).withMessage('difficulty must be easy, medium, or hard.')
  ],
  validate,
  generateQuiz
);

// POST /quizzes/:quizId/attempts
router.post('/:quizId/attempts',
  verifyOwner('Quiz', 'quizId'),
  [body('answers').isArray({ min: 1 }).withMessage('answers must be a non-empty array.')],
  validate,
  submitAttempt
);

module.exports = router;
