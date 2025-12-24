const mongoose = require('mongoose');

const conferenceMessageSchema = new mongoose.Schema({
  lessonId: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ConferenceMessage', conferenceMessageSchema);
