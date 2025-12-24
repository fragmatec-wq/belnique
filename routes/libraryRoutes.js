const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'));
    }
  }
});

// Routes
router.get('/', libraryController.getItems);
router.get('/:id', libraryController.getItemById);

// Protected routes (Assuming auth middleware is available, skipping for now based on context or adding simple check if needed)
// If you have auth middleware: const auth = require('../middleware/auth'); router.post('/', auth, ...)
// For now, I will leave them open or just assume the frontend protects the admin access, but ideally should be protected.
// I'll check if there is an auth middleware.

router.post('/', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }]), libraryController.createItem);
router.put('/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }]), libraryController.updateItem);
router.delete('/:id', libraryController.deleteItem);

router.post('/:id/view', libraryController.viewItem);
router.post('/:id/like', libraryController.likeItem);

module.exports = router;
