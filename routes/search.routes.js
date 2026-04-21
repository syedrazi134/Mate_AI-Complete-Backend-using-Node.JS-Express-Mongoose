const router = require('express').Router();

const { searchContent } = require('../controllers/search.controller');
const { verifyToken }   = require('../middleware/auth.middleware');

// middleware
router.use(verifyToken);

// GET /search?q=&type=&subjectId=
router.get('/', searchContent);

module.exports = router;
