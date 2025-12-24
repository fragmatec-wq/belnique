const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  professor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  description: {
    type: String
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  capacity: {
    type: Number,
    default: 30
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  lessons: [
    {
      title: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['scheduled', 'video'],
        required: true
      },
      mode: {
        type: String,
        enum: ['online', 'other'],
      },
      date: { type: Date },
      time: { type: String },
      location: { type: String },
      meetingLink: { type: String },
      accessCode: { type: String },
      videoUrl: { type: String },
      videoPath: { type: String }, // path for uploaded video
      supportMaterial: { type: String }, // file path for PDF
      status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
      },
      createdAt: { type: Date, default: Date.now },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Classroom', classroomSchema);
