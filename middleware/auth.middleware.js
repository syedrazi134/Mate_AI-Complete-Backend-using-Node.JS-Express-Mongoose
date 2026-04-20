const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { AppError } = require('./errorHandler');

/**
 * verifyToken – extracts Bearer JWT from Authorization header,
 * verifies it, and attaches decoded payload to req.user.
 */
const verifyToken = (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return next(new AppError('Access token missing.', 401, 'TOKEN_MISSING'));
    }

    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = decoded; // { userId, email }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new AppError('Access token expired.', 401, 'TOKEN_EXPIRED'));
        }
        return next(new AppError('Invalid access token.', 401, 'INVALID_TOKEN'));
    }
};

/**
 * verifyOwner(ModelName, paramName) – factory middleware that loads a
 * resource from DB and checks ownership before passing to the controller.
 *
 * Usage:
 *   router.delete('/:noteId', verifyToken, verifyOwner('Note', 'noteId'), controller.delete);
 */
const verifyOwner = (modelName, paramName) => async (req, _res, next) => {
    try {
        const Model = mongoose.model(modelName);
        const resourceId = req.params[paramName];

        if (!mongoose.Types.ObjectId.isValid(resourceId)) {
            return next(new AppError(`${modelName} not found.`, 404, 'NOT_FOUND'));
        }

        const resource = await Model.findById(resourceId);
        if (!resource) {
            return next(new AppError(`${modelName} not found.`, 404, 'NOT_FOUND'));
        }

        const ownerId = resource.userId || resource.user;
        if (ownerId.toString() !== req.user.userId) {
            return next(new AppError('Access forbidden – not the resource owner.', 403, 'FORBIDDEN'));
        }

        req.resource = resource;
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = { verifyToken, verifyOwner };