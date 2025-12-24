const mongoose = require('mongoose');

const lessonSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String }, // Text content or description
  videoUrl: { type: String },
  duration: { type: Number }, // in minutes
  isFree: { type: Boolean, default: false }, // Preview available
});

const moduleSchema = mongoose.Schema({
  title: { type: String, required: true },
  lessons: [lessonSchema],
});

const courseSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    thumbnail: { type: String },
    price: { type: Number, default: 0 },
    category: { type: String },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    duration: { type: String },
    isFeatured: { type: Boolean, default: false },
    modules: [moduleSchema],
    studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
