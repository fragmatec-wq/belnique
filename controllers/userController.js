const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const logActivity = require('../utils/activityLogger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const Classroom = require('../models/Classroom'); // Import Classroom model
const Assessment = require('../models/Assessment'); // Import Assessment model
 
// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      phone: user.phone,
      location: user.location,
      website: user.website,
      specialization: user.specialization,
      avatar: user.profileImage,
      preferences: user.preferences,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'student', // Default to student
  });

  if (user) {
    // Log Activity
    logActivity({
      user: user._id,
      action: 'USER_REGISTER',
      details: `New user registered: ${user.name} (${user.role})`,
      targetId: user._id
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      avatar: user.profileImage,
      preferences: user.preferences,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      phone: user.phone,
      location: user.location,
      website: user.website,
      specialization: user.specialization,
      avatar: user.profileImage,
      preferences: user.preferences,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  const users = await User.find({});
  res.json(users);
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.bio = req.body.bio || user.bio;
    user.phone = req.body.phone || user.phone;
    user.location = req.body.location || user.location;
    user.website = req.body.website || user.website;
    
    if (user.role === 'professor' && req.body.specialization) {
        user.specialization = req.body.specialization;
    }

    if (req.body.avatar !== undefined) {
      user.profileImage = req.body.avatar;
    }
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    // Update preferences if provided
    if (req.body.preferences) {
      user.preferences = {
        ...user.preferences,
        ...req.body.preferences,
        notifications: { ...user.preferences.notifications, ...req.body.preferences.notifications },
        appearance: { ...user.preferences.appearance, ...req.body.preferences.appearance },
        privacy: { ...user.preferences.privacy, ...req.body.preferences.privacy },
        studentMode: req.body.preferences.studentMode !== undefined ? req.body.preferences.studentMode : user.preferences.studentMode
      };
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      bio: updatedUser.bio,
      phone: updatedUser.phone,
      location: updatedUser.location,
      website: updatedUser.website,
      specialization: updatedUser.specialization,
      avatar: updatedUser.profileImage,
      preferences: updatedUser.preferences,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

const getDashboardStats = async (req, res) => {
  const user = req.user;
  let stats = {};

  if (user.role === 'student') {
    // Compute real stats based on enrolled courses and related classrooms
    const enrolledCount = Array.isArray(user.enrolledCourses) ? user.enrolledCourses.length : 0;
    let classroomsCount = 0;
    let totalLessons = 0;
    let completedLessons = 0;

    if (enrolledCount > 0) {
      const classrooms = await Classroom.find({ status: 'active', course: { $in: user.enrolledCourses } });
      classroomsCount = classrooms.length;
      classrooms.forEach(c => {
        if (Array.isArray(c.lessons)) {
          totalLessons += c.lessons.length;
          completedLessons += c.lessons.filter(l => l.status === 'completed').length;
        }
      });
    } else {
      const classrooms = await Classroom.find({ status: 'active' });
      classroomsCount = classrooms.length;
      // Without enrollments, we cannot map progress; keep zero
    }

    const averageProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    stats = {
      enrolledCourses: enrolledCount,
      averageProgress,
      completedLessons,
      classrooms: classroomsCount,
      studyDays: user.studyLog || []
    };
  } else if (user.role === 'professor') {
    // Fetch real stats for professor
    const activeClasses = await Classroom.countDocuments({ professor: user._id, status: 'active' });
    
    // Calculate total lessons and next class
    const classrooms = await Classroom.find({ professor: user._id, status: 'active' });
    
    // Calculate total students
    const courseIds = classrooms.map(c => c.course).filter(id => id);
    const totalStudents = await User.countDocuments({ enrolledCourses: { $in: courseIds }, role: 'student' });

    let totalLessons = 0;
    let allScheduledLessons = [];
    const now = new Date();

    classrooms.forEach(classroom => {
      if (classroom.lessons) {
        totalLessons += classroom.lessons.length;
        classroom.lessons.forEach(lesson => {
           if (lesson.type === 'scheduled' && lesson.status === 'scheduled' && lesson.date) {
             const lessonDate = new Date(lesson.date);
             if (lessonDate > now) {
                allScheduledLessons.push({
                    _id: lesson._id,
                    title: lesson.title,
                    date: lessonDate,
                    time: lesson.time,
                    classroomName: classroom.name,
                    mode: lesson.mode,
                    location: lesson.location
                });
             }
           }
        });
      }
    });

    // Sort by date ascending
    allScheduledLessons.sort((a, b) => a.date - b.date);
    const upcomingClasses = allScheduledLessons.slice(0, 2);
    const nextClassData = upcomingClasses.length > 0 ? upcomingClasses[0] : null;

    let nextClassString = 'Nenhuma aula agendada';
    if (nextClassData) {
       const dateStr = nextClassData.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
       nextClassString = `${nextClassData.title} (${dateStr} - ${nextClassData.time})`;
    }

    stats = {
      totalStudents,
      activeClasses,
      totalLessons,
      nextClass: nextClassString,
      nextClassData,
      upcomingClasses // Return top 2
    };
  } else if (user.role === 'collector') {
    stats = {
      acquiredArtworks: 4,
      favorites: 12,
      activityLevel: 8,
      balance: '150.000',
      // Include student stats for hybrid mode
      studentStats: {
        enrolledCourses: user.enrolledCourses ? user.enrolledCourses.length : 0,
        averageProgress: 0, // Placeholder
        completedLessons: 0, // Placeholder
        classrooms: 0, // Placeholder
        studyDays: user.studyLog || []
      }
    };
  }

  res.json(stats);
};

// @desc    Get all students for professor
// @route   GET /api/users/professor/students
// @access  Private (Professor)
const getProfessorStudents = async (req, res) => {
  const classrooms = await Classroom.find({ professor: req.user._id });
  const courseIds = classrooms.map(c => c.course).filter(id => id);
  
  const students = await User.find({ 
    enrolledCourses: { $in: courseIds }, 
    role: 'student' 
  }).select('name profileImage phone email');

  res.json(students);
};

// @desc    Get all scheduled lessons for professor
// @route   GET /api/users/professor/schedule
// @access  Private (Professor)
const getProfessorSchedule = async (req, res) => {
  const classrooms = await Classroom.find({ professor: req.user._id }).populate('course', 'title');
  let schedule = [];

  classrooms.forEach(classroom => {
    if (classroom.lessons) {
      classroom.lessons.forEach(lesson => {
         if (lesson.type === 'scheduled' && lesson.status !== 'cancelled') {
           schedule.push({
             ...lesson.toObject(),
             classroomName: classroom.name,
             courseName: classroom.course ? classroom.course.title : 'N/A',
             classroomId: classroom._id
           });
         }
      });
    }
  });

  // Sort by date
  schedule.sort((a, b) => new Date(a.date) - new Date(b.date));
  res.json(schedule);
};

// @desc    Get all assessments for professor
// @route   GET /api/users/professor/assessments
// @access  Private (Professor)
const getProfessorAssessments = async (req, res) => {
    const assessments = await Assessment.find({ professor: req.user._id })
                                      .populate('classroom', 'name')
                                      .sort({ createdAt: -1 });
    res.json(assessments);
};

module.exports = { 
  authUser, 
  registerUser, 
  getUserProfile, 
  updateUserProfile, 
  getDashboardStats, 
  getUsers,
  getProfessorStudents,
  getProfessorSchedule,
  getProfessorAssessments
};
