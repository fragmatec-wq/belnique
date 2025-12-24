const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markNotificationRead,
  markAllRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getNotifications);
router.route('/readall').put(protect, markAllRead);
router.route('/:id/read').put(protect, markNotificationRead);

module.exports = router;
