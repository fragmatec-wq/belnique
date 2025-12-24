const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getArtworks,
  createArtwork,
  viewArtwork,
  likeArtwork,
  commentArtwork,
  placeBid,
  buyArtwork,
  deleteArtwork,
  updateArtwork
} = require('../controllers/galleryController');

// Multer config for image upload
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|gif|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

// Routes
router.route('/')
  .get(getArtworks)
  .post(upload.array('images', 5), createArtwork); // Allow up to 5 images

router.route('/:id')
  .delete(deleteArtwork)
  .put(upload.array('images', 5), updateArtwork);

router.post('/:id/view', viewArtwork);
router.post('/:id/like', likeArtwork);
router.post('/:id/comment', commentArtwork);
router.post('/:id/bid', placeBid);
router.post('/:id/buy', buyArtwork);

module.exports = router;
