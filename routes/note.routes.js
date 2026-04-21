const router = require('express').Router();

const { uploadNote, listNotes, getNoteDetails, deleteNote } = require('../controllers/note.controller');
const { verifyToken, verifyOwner } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// middleware
router.use(verifyToken);

// POST /notes  (multipart)
router.post('/', upload.single('file'), uploadNote);

// GET  /api/v1/notes?subjectId=
router.get('/', listNotes);

// GET  /notes/:noteId
router.get('/:noteId',
  verifyOwner('Note', 'noteId'),
  getNoteDetails
);

// DELETE /notes/:noteId
router.delete('/:noteId',
  verifyOwner('Note', 'noteId'),
  deleteNote
);

module.exports = router;
