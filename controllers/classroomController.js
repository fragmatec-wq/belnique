const Classroom = require('../models/Classroom');

exports.getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find()
      .populate('course', 'title')
      .populate('professor', 'name')
      .sort({ createdAt: -1 });
    res.json(classrooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getClassroomsByProfessor = async (req, res) => {
  try {
    const classrooms = await Classroom.find({ professor: req.user._id })
      .populate('course', 'title')
      .sort({ createdAt: -1 });
    res.json(classrooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStudentClassrooms = async (req, res) => {
  try {
    const enrolledCourseIds = Array.isArray(req.user?.enrolledCourses) ? req.user.enrolledCourses : [];
    const query = { status: 'active' };
    if (enrolledCourseIds.length > 0) {
      query.course = { $in: enrolledCourseIds };
    }

    const classrooms = await Classroom.find(query)
      .populate('course', 'title')
      .populate('professor', 'name')
      .sort({ createdAt: -1 });
    res.json(classrooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getClassroomById = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate('course', 'title')
      .populate('professor', 'name');
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    res.json(classroom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createClassroom = async (req, res) => {
  const classroom = new Classroom({
    name: req.body.name,
    description: req.body.description,
    course: req.body.course,
    professor: req.body.professor,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    capacity: req.body.capacity,
    status: req.body.status
  });

  try {
    const newClassroom = await classroom.save();
    // Populate before sending back
    await newClassroom.populate('course', 'title');
    await newClassroom.populate('professor', 'name');
    res.status(201).json(newClassroom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    if (req.body.name !== undefined) classroom.name = req.body.name;
    if (req.body.description !== undefined) classroom.description = req.body.description;
    if (req.body.course !== undefined) classroom.course = req.body.course;
    if (req.body.professor !== undefined) classroom.professor = req.body.professor;
    if (req.body.startDate !== undefined) classroom.startDate = req.body.startDate;
    if (req.body.endDate !== undefined) classroom.endDate = req.body.endDate;
    if (req.body.capacity !== undefined) classroom.capacity = req.body.capacity;
    if (req.body.status !== undefined) classroom.status = req.body.status;

    const updatedClassroom = await classroom.save();
    await updatedClassroom.populate('course', 'title');
    await updatedClassroom.populate('professor', 'name');
    
    res.json(updatedClassroom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    await classroom.deleteOne();
    res.json({ message: 'Classroom deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Add lesson to classroom
// @route   POST /api/classrooms/:id/lessons
// @access  Private/Admin
exports.addLesson = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

    const {
      title,
      type,
      mode,
      date,
      time,
      location,
      meetingLink,
      accessCode,
      videoUrl
    } = req.body;

    let supportMaterial = undefined;
    let videoPath = undefined;

    if (req.files) {
      if (req.files.material) {
        supportMaterial = `/uploads/${req.files.material[0].filename}`;
      }
      if (req.files.video) {
        videoPath = `/uploads/${req.files.video[0].filename}`;
      }
    }

    const lesson = {
      title,
      type,
      mode,
      date: date ? new Date(date) : undefined,
      time,
      location,
      meetingLink,
      accessCode,
      videoUrl,
      videoPath,
      supportMaterial,
      createdBy: req.user ? req.user._id : undefined
    };

    classroom.lessons = classroom.lessons || [];
    classroom.lessons.push(lesson);
    await classroom.save();

    res.status(201).json(lesson);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateLessonStatus = async (req, res) => {
  try {
    const { classroomId, lessonId } = req.params;
    const { status } = req.body;

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Check if user is admin or the professor of the classroom
    const isAdmin = ['admin', 'administrator1', 'Superadministrator2'].includes(req.user.role);
    if (!isAdmin && classroom.professor.toString() !== req.user._id.toString()) {
         return res.status(403).json({ message: 'Not authorized to update this lesson' });
    }

    const lesson = classroom.lessons.id(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    lesson.status = status;
    await classroom.save();

    res.json(lesson);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
