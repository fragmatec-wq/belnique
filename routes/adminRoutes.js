const express = require('express');
const router = express.Router();
const {
  authAdmin,
  registerAdmin,
  getAdminProfile,
  getDashboardStats,
  getAllUsers,
  deleteUser,
  createUser,
  getActivities,
  getUserById,
  toggleBlockUser
} = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/adminAuthMiddleware');
const { resetProfessorPassword } = require('../controllers/adminController');

router.post('/', registerAdmin);
router.post('/login', authAdmin);
router.get('/profile', protectAdmin, getAdminProfile);
router.get('/stats', protectAdmin, getDashboardStats);
router.get('/users', protectAdmin, getAllUsers);
router.post('/users', protectAdmin, createUser);
router.delete('/users/:id', protectAdmin, deleteUser);
router.get('/users/:id', protectAdmin, getUserById);
router.put('/users/:id/block', protectAdmin, toggleBlockUser);
router.post('/users/:id/reset-password', protectAdmin, resetProfessorPassword);
router.get('/activities', protectAdmin, getActivities);

module.exports = router;
