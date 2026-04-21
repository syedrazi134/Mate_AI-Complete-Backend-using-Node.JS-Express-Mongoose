const Note    = require('../models/Note.model');
const Subject = require('../models/Subject.model');
const { AppError } = require('../middleware/errorHandler');
const path = require('path');

// Helper: map MIME to fileType enum
const mimeToType = (mime) => {
  if (mime === 'application/pdf')          return 'pdf';
  if (mime.startsWith('image/'))           return 'image';
  if (mime === 'text/plain')               return 'text';
  return 'text';
};

// ── POST /notes ########################################################
const uploadNote = async (req, res, next) => {
  try {
    const { subjectId, title } = req.body;
    if (!req.file) return next(new AppError('No file attached.', 400, 'NO_FILE'));
    if (!subjectId) return next(new AppError('subjectId is required.', 400, 'VALIDATION_ERROR'));

    // Verify subject ownership
    const subject = await Subject.findById(subjectId);
    if (!subject) return next(new AppError('Subject not found.', 404, 'NOT_FOUND'));
    if (subject.userId.toString() !== req.user.userId) {
      return next(new AppError('Access forbidden.', 403, 'FORBIDDEN'));
    }

    // In production, upload req.file.buffer to cloud storage and get a URL.
    // Here we store a placeholder URL.
    const fileUrl  = `/uploads/${Date.now()}-${req.file.originalname}`;
    const fileType = mimeToType(req.file.mimetype);
    const noteTitle = title || path.parse(req.file.originalname).name;

    const note = await Note.create({
      userId: req.user.userId,
      subjectId,
      title:    noteTitle,
      fileUrl,
      fileType,
      status:   'processing'
    });

    // TODO: queue background AI text-extraction job here

    res.status(201).json({
      id:        note._id,
      title:     note.title,
      fileUrl:   note.fileUrl,
      fileType:  note.fileType,
      subjectId: note.subjectId,
      status:    note.status,
      createdAt: note.createdAt
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /notes?subjectId=:id ########################################################
const listNotes = async (req, res, next) => {
  try {
    const { subjectId } = req.query;
    if (!subjectId) return next(new AppError('subjectId query param required.', 400, 'VALIDATION_ERROR'));

    const subject = await Subject.findById(subjectId);
    if (!subject) return next(new AppError('Subject not found.', 404, 'NOT_FOUND'));
    if (subject.userId.toString() !== req.user.userId) {
      return next(new AppError('Access forbidden.', 403, 'FORBIDDEN'));
    }

    const notes = await Note.find({ subjectId }).select('_id title fileType status createdAt').sort('-createdAt');

    res.status(200).json({
      notes: notes.map(n => ({
        id: n._id, title: n.title, fileType: n.fileType, status: n.status, createdAt: n.createdAt
      }))
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /notes/:noteId ########################################################
const getNoteDetails = async (req, res, next) => {
  try {
    const note = req.resource;    // set by verifyOwner
    res.status(200).json({
      id:            note._id,
      title:         note.title,
      fileUrl:       note.fileUrl,
      fileType:      note.fileType,
      status:        note.status,
      subjectId:     note.subjectId,
      extractedText: note.extractedText
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /notes/:noteId ########################################################
const deleteNote = async (req, res, next) => {
  try {
    await req.resource.deleteOne();
    // TODO: queue async storage deletion job
    res.status(200).json({ success: true, message: 'Note deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadNote, listNotes, getNoteDetails, deleteNote };
