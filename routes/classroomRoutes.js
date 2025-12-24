const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroomController');
const multer = require('multer');
const path = require('path');
const { protect, admin } = require('../middleware/authMiddleware');

// Multer for file uploads (PDF and Video)
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

function checkFileType(file, cb) {
  const filetypes = /pdf|mp4|mov|avi|mkv/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Only PDF and Video files are allowed!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

router.route('/')
  .get(protect, admin, classroomController.getAllClassrooms)
  .post(protect, admin, classroomController.createClassroom);

router.get('/professor/my-classrooms', protect, classroomController.getClassroomsByProfessor);
router.get('/student/my-classrooms', protect, classroomController.getStudentClassrooms);

router.route('/:id')
  .get(protect, classroomController.getClassroomById)
  .put(protect, admin, classroomController.updateClassroom)
  .delete(protect, admin, classroomController.deleteClassroom);

router.post('/:id/lessons', protect, admin, upload.fields([
  { name: 'material', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), classroomController.addLesson);

router.put('/:classroomId/lessons/:lessonId/status', protect, classroomController.updateLessonStatus);

module.exports = router;
