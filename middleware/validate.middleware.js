const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');


// Runs after express-validator checks; converts errors to structured 400 response.

const validate = (req, _res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const details = {};
        errors.array().forEach(e => { details[e.path] = e.msg; });
        return next(new AppError('Request body validation failed.', 400, 'VALIDATION_ERROR', details));
    }
    next();
};

module.exports = { validate };