const Subject = require('../models/Subject.model');
const Note    = require('../models/Note.model');
const { AppError } = require('../middleware/errorHandler');

// ── GET /subjects ########################################################
const listSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ userId: req.user.userId }).sort('-createdAt');

    // Attach note counts
    const result = await Promise.all(subjects.map(async s => {
      const notesCount = await Note.countDocuments({ subjectId: s._id });
      return { id: s._id, name: s.name, color: s.color, notesCount, createdAt: s.createdAt };
    }));

    res.status(200).json({ subjects: result });
  } catch (err) {
    next(err);
  }
};

// ── POST /subjects ########################################################
const createSubject = async (req, res, next) => {
  try {
    const { name, color } = req.body;

    const subject = await Subject.create({ userId: req.user.userId, name, color });

    res.status(201).json({
      id: subject._id, name: subject.name, color: subject.color, createdAt: subject.createdAt
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError('A subject with this name already exists.', 409, 'DUPLICATE_SUBJECT'));
    }
    next(err);
  }
};

// ── PUT /subjects/:subjectId ########################################################
const updateSubject = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    const subject = req.resource;                   // set by verifyOwner

    if (name)  subject.name  = name;
    if (color) subject.color = color;
    await subject.save();

    res.status(200).json({
      success: true,
      subject: { id: subject._id, name: subject.name, color: subject.color }
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /subjects/:subjectId ########################################################
const deleteSubject = async (req, res, next) => {
  try {
    const subject = req.resource;

    // Cascade: delete all notes belonging to this subject
    await Note.deleteMany({ subjectId: subject._id });
    await subject.deleteOne();

    res.status(200).json({ success: true, message: 'Subject and all associated notes deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listSubjects, createSubject, updateSubject, deleteSubject };
