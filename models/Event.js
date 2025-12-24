const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  locationType: { 
    type: String, 
    enum: ['Online', 'Presencial'], 
    default: 'Online' 
  },
  image: { type: String },
  price: { type: Number, default: 0 },
  maxSpots: { type: Number, default: 50 },
  isFree: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  instructor: { type: String },
  category: { 
    type: String, 
    default: 'Workshop' 
  },
  organizer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  attendees: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
