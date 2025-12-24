const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Pintura', 'Fotografia', 'Escultura', 'História da Arte', 'Design Digital', 'Outro'],
    default: 'Outro'
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['view_only', 'sale', 'auction'],
    required: true
  },
  price: {
    type: Number, // For sale or starting price for auction
    default: 0
  },
  currentBid: {
    type: Number,
    default: 0
  },
  bids: [{
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    date: { type: Date, default: Date.now }
  }],
  images: [{
    type: String, // Array of image URLs
    required: true
  }],
  status: {
    type: String,
    enum: ['available', 'sold'],
    default: 'available'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    text: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Artwork', artworkSchema);
