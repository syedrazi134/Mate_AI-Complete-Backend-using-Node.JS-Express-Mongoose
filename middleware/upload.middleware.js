const multer = require('multer');
const { AppError } = require('./errorHandler');

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new AppError(
                'Unsupported file type. Only PDF, JPEG, PNG, and TXT are allowed.',
                400,
                'UNSUPPORTED_FILE_TYPE'
            ));
        }
    }
});

module.exports = upload;