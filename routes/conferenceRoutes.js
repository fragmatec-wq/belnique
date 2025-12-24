const express = require('express');
const router = express.Router();
const { getMessages, sendMessage } = require('../controllers/conferenceController');

router.get('/:lessonId/messages', getMessages);
router.post('/:lessonId/messages', sendMessage);

module.exports = router;
