const router  = require('express').Router();
const { body } = require('express-validator');

const { listSubjects, createSubject, updateSubject, deleteSubject } = require('../controllers/subject.controller');
const { verifyToken, verifyOwner } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

// middleware
router.use(verifyToken);

// GET  /subjects
router.get('/', listSubjects);

// POST /subjects
router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Subject name is required.'),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex code.')
  ],
  validate,
  createSubject
);

// PUT  /subjects/:subjectId
router.put('/:subjectId',
  verifyOwner('Subject', 'subjectId'),
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.'),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex code.')
  ],
  validate,
  updateSubject
);

// DELETE /subjects/:subjectId
router.delete('/:subjectId',
  verifyOwner('Subject', 'subjectId'),
  deleteSubject
);

module.exports = router;
