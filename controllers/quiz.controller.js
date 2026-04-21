const Quiz    = require('../models/Quiz.model');
const Subject = require('../models/Subject.model');
const Note    = require('../models/Note.model');
const { AppError } = require('../middleware/errorHandler');

// ── POST /quizzes/generate ########################################################
const generateQuiz = async (req, res, next) => {
  try {
    const { subjectId, questionCount = 10, difficulty = 'medium', questionTypes } = req.body;

    if (questionCount < 1 || questionCount > 30) {
      return next(new AppError('questionCount must be between 1 and 30.', 400, 'VALIDATION_ERROR'));
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) return next(new AppError('Subject not found.', 404, 'NOT_FOUND'));
    if (subject.userId.toString() !== req.user.userId) {
      return next(new AppError('Access forbidden.', 403, 'FORBIDDEN'));
    }

    const readyNotes = await Note.find({ subjectId, status: 'ready' });
    if (readyNotes.length === 0) {
      return next(new AppError('No ready notes available to generate a quiz from.', 422, 'NO_CONTENT'));
    }

    // ── AI call placeholder ########################################################
    // const questions = await callAI_generateQuiz(readyNotes, questionCount, difficulty, questionTypes);
    const types    = questionTypes || ['mcq', 'true_false'];
    const questions = Array.from({ length: questionCount }, (_, i) => ({
      type:          types[i % types.length],
      question:      `Sample question ${i + 1} (${difficulty})`,
      options:       types[i % types.length] === 'mcq' ? ['A) Option 1','B) Option 2','C) Option 3','D) Option 4'] : null,
      correctAnswer: types[i % types.length] === 'mcq' ? 'A) Option 1' : 'True',
      explanation:   'This is the explanation for the correct answer.'
    }));
    // ######################################################################

    const quiz = await Quiz.create({
      userId: req.user.userId,
      subjectId,
      title: `${subject.name} Quiz – ${difficulty}`,
      questions
    });

    res.status(201).json({
      quizId:    quiz._id,
      title:     quiz.title,
      questions: quiz.questions.map(q => ({
        id: q._id, type: q.type, question: q.question,
        options: q.options   // correctAnswer is NOT sent to client
      }))
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /quizzes/:quizId/attempts ########################################################
const submitAttempt = async (req, res, next) => {
  try {
    const quiz = req.resource;    // set by verifyOwner

    if (quiz.submitted) {
      return next(new AppError('Quiz already submitted.', 409, 'ALREADY_SUBMITTED'));
    }

    const { answers } = req.body;
    if (!answers || answers.length !== quiz.questions.length) {
      return next(new AppError('Answer count does not match question count.', 400, 'VALIDATION_ERROR'));
    }

    let score = 0;
    const results = quiz.questions.map(q => {
      const given   = answers.find(a => a.questionId === q._id.toString());
      const correct = given && given.answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      if (correct) score++;
      return {
        questionId:    q._id,
        correct:       !!correct,
        correctAnswer: q.correctAnswer,
        explanation:   q.explanation
      };
    });

    quiz.submitted = true;
    await quiz.save();

    const total   = quiz.questions.length;
    const percent = parseFloat(((score / total) * 100).toFixed(2));

    res.status(200).json({ score, total, percent, results });
  } catch (err) {
    next(err);
  }
};

module.exports = { generateQuiz, submitAttempt };
