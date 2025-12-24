const mongoose = require('mongoose');

const SiteContentSchema = new mongoose.Schema({
  section: {
    type: String,
    required: true,
    unique: true,
    enum: ['hero', 'features', 'stats', 'footer', 'announcement']
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('SiteContent', SiteContentSchema);
