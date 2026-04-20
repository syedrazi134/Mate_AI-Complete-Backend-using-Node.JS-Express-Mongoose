const ChatSession = require('../models/ChatSession.model');
const Subject     = require('../models/Subject.model');
const Note        = require('../models/Note.model');
const { AppError } = require('../middleware/errorHandler');

// ── POST /chat/sessions ########################################################
const createSession = async (req, res, next) => {
  try {
    const { subjectId, title } = req.body;

    const subject = await Subject.findById(subjectId);
    if (!subject) return next(new AppError('Subject not found.', 404, 'NOT_FOUND'));
    if (subject.userId.toString() !== req.user.userId) {
      return next(new AppError('Access forbidden.', 403, 'FORBIDDEN'));
    }

    const session = await ChatSession.create({
      userId: req.user.userId,
      subjectId,
      title: title || `Chat – ${subject.name}`
    });

    res.status(201).json({
      sessionId:  session._id,
      subjectId:  session.subjectId,
      title:      session.title,
      createdAt:  session.createdAt
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /chat/sessions/:sessionId/messages ###################################
const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return next(new AppError('Message cannot be empty.', 400, 'VALIDATION_ERROR'));
    }

    const session = req.resource;    // set by verifyOwner

    // Check for ready notes (context)
    const readyNotes = await Note.find({ subjectId: session.subjectId, status: 'ready' });

    // Build context from extracted text
    const context = readyNotes.map(n => n.extractedText).filter(Boolean).join('\n\n');

    // ── AI call placeholder ########################################################
    // Replace this block with actual Gemini / OpenAI API call.
    // const aiResponse = await callGeminiAPI(context, session.messages, message);
    const aiResponseContent = readyNotes.length > 0
      ? `[AI response to: "${message}" — context loaded from ${readyNotes.length} note(s)]`
      : `[AI response to: "${message}" — no ready notes, using general knowledge]`;


    const userMsg = { role: 'user',      content: message,          timestamp: new Date() };
    const aiMsg   = { role: 'assistant', content: aiResponseContent, timestamp: new Date() };

    session.messages.push(userMsg, aiMsg);
    await session.save();

    const saved = session.messages.slice(-2);
    res.status(200).json({
      userMessage: { id: saved[0]._id, role: 'user',      content: saved[0].content, timestamp: saved[0].timestamp },
      aiResponse:  { id: saved[1]._id, role: 'assistant', content: saved[1].content, timestamp: saved[1].timestamp }
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /chat/sessions/:sessionId/messages ########################################################
const getChatHistory = async (req, res, next) => {
  try {
    const session = req.resource;
    res.status(200).json({
      sessionId: session._id,
      messages:  session.messages.map(m => ({
        id: m._id, role: m.role, content: m.content, timestamp: m.timestamp
      }))
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createSession, sendMessage, getChatHistory };
