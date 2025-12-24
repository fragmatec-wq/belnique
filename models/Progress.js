const mongoose = require('mongoose');

const progressSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId }], // IDs of completed lessons
    progressPercentage: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    lastAccessed: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Progress = mongoose.model('Progress', progressSchema);
module.exports = Progress;
