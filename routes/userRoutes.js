const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getDashboardStats,
  getUsers,
  getProfessorStudents,
  getProfessorSchedule,
  getProfessorAssessments
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);
router.get('/', protect, getUsers);
router.get('/dashboard-stats', protect, getDashboardStats);
router.get('/professor/students', protect, getProfessorStudents);
router.get('/professor/schedule', protect, getProfessorSchedule);
router.get('/professor/assessments', protect, getProfessorAssessments);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

module.exports = router;
