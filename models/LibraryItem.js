const mongoose = require('mongoose');

const libraryItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['ebook', 'tutorial'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  durationOrPages: {
    type: String, // e.g., "12 min leitura" or "120 páginas"
    required: true
  },
  imageUrl: {
    type: String,
    required: true // Path to the image
  },
  fileUrl: {
    type: String, // Path to the PDF or resource file (required for ebooks)
    required: function() { return this.type === 'ebook'; }
  },
  content: {
    type: String // Markdown or HTML content for tutorials
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LibraryItem', libraryItemSchema);
