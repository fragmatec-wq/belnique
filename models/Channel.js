const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ['feed', 'chat'],
    default: 'feed'
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  allowedRoles: [{
    type: String,
    enum: ['student', 'professor', 'collector', 'admin']
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Channel', channelSchema);
