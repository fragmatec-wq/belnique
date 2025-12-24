const express = require('express');
const router = express.Router();
const { getContent, getAllContent, updateContent } = require('../controllers/contentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getAllContent);
router.get('/:section', getContent);
router.put('/:section', protect, admin, updateContent);

module.exports = router;
