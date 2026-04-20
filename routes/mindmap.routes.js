const router  = require('express').Router();
const { body } = require('express-validator');

const { generateMindMap, getMindMap } = require('../controllers/mindmap.controller');
const { verifyToken, verifyOwner }    = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

// middleware
router.use(verifyToken);

// POST /mindmaps/generate
router.post('/generate',
  [body('subjectId').notEmpty().withMessage('subjectId is required.')],
  validate,
  generateMindMap
);

// GET /mindmaps/:mindMapId
router.get('/:mindMapId',
  verifyOwner('MindMap', 'mindMapId'),
  getMindMap
);

module.exports = router;
