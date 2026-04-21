require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { globalErrorHandler } = require('./middleware/errorHandler');
const rateLimit = require('express-rate-limit');

// ### Route imports ##############################################################
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const subjectRoutes = require('./routes/subject.routes');
const noteRoutes = require('./routes/note.routes');
const chatRoutes = require('./routes/chat.routes');
const quizRoutes = require('./routes/quiz.routes');
const flashcardRoutes = require('./routes/flashcard.routes');
const mindmapRoutes = require('./routes/mindmap.routes');
const searchRoutes = require('./routes/search.routes');

// ## DB ###########################################################################
connectDB();

const app = express();

// ### Global Middleware ###########################################################
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Global rate limiter
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, errorCode: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, try again later.' }
});
app.use(globalLimiter);

// ### Routes #######################################################################
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/subjects', subjectRoutes);
app.use('/notes', noteRoutes);
app.use('/chat', chatRoutes);
app.use('/flashcards', flashcardRoutes);
app.use('/mindmaps', mindmapRoutes);
app.use('/search', searchRoutes);
app.use('/quizzes', quizRoutes);

// ### Health check ###################################################################
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ### 404 handler ####################################################################
app.use((_req, res) => {
    res.status(404).json({ success: false, status: 404, errorCode: 'NOT_FOUND', message: 'Route not found.' });
});

// ### Global error handler ###########################################################
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is Listening on port: ${PORT}`));