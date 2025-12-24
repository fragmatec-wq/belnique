const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const blogController = require('../controllers/blogController');

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/', blogController.getArticles);
router.post('/', upload.single('coverImage'), blogController.createArticle);
router.put('/:id', upload.single('coverImage'), blogController.updateArticle);
router.post('/upload-image', upload.single('image'), blogController.uploadInlineImage);
router.delete('/:id', blogController.deleteArticle);
router.post('/:id/like', blogController.likeArticle);
router.post('/:id/comment', blogController.commentArticle);
router.post('/:id/view', blogController.viewArticle);

module.exports = router;
