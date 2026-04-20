// AppError – custom error class so controllers can throw structured errors
class AppError extends Error {
    constructor(message, status = 500, errorCode = 'INTERNAL_ERROR', details = null) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
        this.details = details;
    }
}


// Global error-handling middleware (must be registered LAST in Express).
const globalErrorHandler = (err, _req, res, _next) => {
    const status = err.status || 500;
    const errorCode = err.errorCode || 'INTERNAL_ERROR';
    const message = err.message || 'An unexpected error occurred.';
    const details = err.details || null;

    if (process.env.NODE_ENV !== 'production') {
        console.error('[ERROR]', err);
    }

    res.status(status).json({ success: false, status, errorCode, message, details });
};

module.exports = { AppError, globalErrorHandler };