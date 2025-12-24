const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent
} = require('../controllers/eventController');

// Multer config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `event-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Images only!');
    }
  },
});

router.route('/')
  .get(getEvents)
  .post(upload.single('image'), createEvent);

router.route('/:id')
  .get(getEventById)
  .put(upload.single('image'), updateEvent)
  .delete(deleteEvent);

router.post('/:id/join', joinEvent);

module.exports = router;
