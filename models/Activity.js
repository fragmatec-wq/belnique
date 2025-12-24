const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Could be Admin too, or system
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false
  },
  action: {
    type: String,
    required: true,
    enum: [
      'USER_REGISTER', 
      'COURSE_CREATE', 
      'EVENT_CREATE', 
      'ARTICLE_CREATE', 
      'ARTWORK_CREATE',
      'USER_DELETE', 
      'COURSE_DELETE', 
      'EVENT_DELETE', 
      'ARTICLE_DELETE'
    ]
  },
  details: {
    type: String,
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Activity', activitySchema);
