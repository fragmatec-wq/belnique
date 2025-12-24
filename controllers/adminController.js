const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Course = require('../models/Course');
const Event = require('../models/Event');
const Article = require('../models/Article');
const Activity = require('../models/Activity');


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth admin & get token
// @route   POST /api/admin/login
// @access  Public
const authAdmin = async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });

  if (admin && (await admin.matchPassword(password))) {
    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Register a new admin
// @route   POST /api/admin
// @access  Public (or protected if only SuperAdmin can create admins)
// For now, let's keep it public or basic for initial setup, 
// but typically only SuperAdmin should create admins. 
// Given the prompt "login e cadastro de contas admin", I'll make it open but maybe I should restrict it? 
// The prompt says "create AdminAuth.tsx for login and register", so it implies a UI for it.
const registerAdmin = async (req, res) => {
  const { name, email, password, role } = req.body;

  const adminExists = await Admin.findOne({ email });

  if (adminExists) {
    res.status(400).json({ message: 'Admin already exists' });
    return;
  }

  // Validate role
  if (role && !['administrator1', 'Superadministrator2'].includes(role)) {
     res.status(400).json({ message: 'Invalid role' });
     return;
  }

  const admin = await Admin.create({
    name,
    email,
    password,
    role: role || 'administrator1',
  });

  if (admin) {
    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid admin data' });
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private
const getAdminProfile = async (req, res) => {
  const admin = await Admin.findById(req.admin._id);

  if (admin) {
    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
  } else {
    res.status(404).json({ message: 'Admin not found' });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalArticles = await Article.countDocuments();
    
    // Get new users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    res.json({
      users: totalUsers,
      courses: totalCourses,
      events: totalEvents,
      articles: totalArticles,
      newUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// @desc    Create a new user (admin only)
// @route   POST /api/admin/users
// @access  Private
const createUser = async (req, res) => {
  const { 
    name, 
    email, 
    password, 
    role,
    phone,
    gender,
    documentType,
    documentNumber,
    address
  } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Generate random password if not provided
    const finalPassword = password || crypto.randomBytes(8).toString('hex');

    const user = await User.create({
      name,
      email,
      password: finalPassword,
      role: role || 'student',
      phone,
      gender,
      documentType,
      documentNumber,
      address
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tempPassword: !password ? finalPassword : undefined // Return password only if generated
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
     res.status(500).json({ message: error.message });
  }
};

// @desc    Get single user details
// @route   GET /api/admin/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};

// @desc    Toggle block/unblock user
// @route   PUT /api/admin/users/:id/block
// @access  Private
const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ _id: user._id, isBlocked: user.isBlocked });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status' });
  }
};

// @desc    Get system activities
// @route   GET /api/admin/activities
// @access  Private
const getActivities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const activities = await Activity.find()
      .populate('user', 'name email profileImage')
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Activity.countDocuments();

    res.json({
      activities,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password for a professor and return the new temp password
// @route   POST /api/admin/users/:id/reset-password
// @access  Private
const resetProfessorPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'professor') return res.status(400).json({ message: 'Apenas professores podem ter senha redefinida por esta ação' });

    const tempPassword = crypto.randomBytes(8).toString('hex');
    user.password = tempPassword;
    await user.save();

    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, tempPassword });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password' });
  }
};

module.exports = {
  authAdmin,
  registerAdmin,
  getAdminProfile,
  getDashboardStats,
  getAllUsers,
  deleteUser,
  createUser,
  getActivities,
  getUserById,
  toggleBlockUser,
  resetProfessorPassword
};
