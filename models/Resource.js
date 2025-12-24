const mongoose = require('mongoose');

const resourceSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    type: { 
      type: String, 
      enum: ['ebook', 'video', 'article', 'tutorial'], 
      required: true 
    },
    url: { type: String, required: true }, // Link to download or view
    thumbnail: { type: String },
    category: { type: String },
    author: { type: String }, // Name of author or User ID
    isPremium: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Resource = mongoose.model('Resource', resourceSchema);
module.exports = Resource;
