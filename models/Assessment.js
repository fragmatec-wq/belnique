const mongoose = require('mongoose');

const assessmentSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dueDate: { type: Date },
  status: { type: String, enum: ['draft', 'published', 'closed'], default: 'draft' },
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    file: { type: String },
    grade: { type: Number },
    submittedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Assessment', assessmentSchema);