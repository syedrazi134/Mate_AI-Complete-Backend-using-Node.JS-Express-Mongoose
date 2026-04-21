const router  = require('express').Router();
const { body } = require('express-validator');

const { createSession, sendMessage, getChatHistory } = require('../controllers/chat.controller');
const { verifyToken, verifyOwner } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

// middleware
router.use(verifyToken);

// POST /chat/sessions
router.post('/sessions',
  [body('subjectId').notEmpty().withMessage('subjectId is required.')],
  validate,
  createSession
);

// POST /chat/sessions/:sessionId/messages
router.post('/sessions/:sessionId/messages',
  verifyOwner('ChatSession', 'sessionId'),
  [body('message').trim().notEmpty().withMessage('message is required.')],
  validate,
  sendMessage
);

// GET /chat/sessions/:sessionId/messages
router.get('/sessions/:sessionId/messages',
  verifyOwner('ChatSession', 'sessionId'),
  getChatHistory
);

module.exports = router;
