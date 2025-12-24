const express = require('express');
const router = express.Router();
const networkingController = require('../controllers/networkingController');
const multer = require('multer');
const path = require('path');

// Multer config for post images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// Channels
router.get('/channels', networkingController.getChannels);
router.post('/channels', networkingController.createChannel);
router.put('/channels/:id', networkingController.updateChannel);
router.delete('/channels/:id', networkingController.deleteChannel);

// Messages
router.get('/messages', networkingController.getMessages);
router.post('/messages', networkingController.createMessage);

// Posts
router.get('/posts', networkingController.getPosts);
router.post('/posts', upload.single('image'), networkingController.createPost);
router.post('/posts/:id/like', networkingController.likePost);
router.post('/posts/:id/comment', networkingController.commentPost);

module.exports = router;
