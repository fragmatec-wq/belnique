const LibraryItem = require('../models/LibraryItem');
const fs = require('fs');
const path = require('path');

// Get all items with optional filtering
exports.getItems = async (req, res) => {
  try {
    const { type, search, category } = req.query;
    let query = {};

    if (type && type !== 'Todos') {
      query.type = type.toLowerCase() === 'e-books' ? 'ebook' : 'tutorial';
    }

    if (category && category !== 'Todos') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await LibraryItem.find(query).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single item
exports.getItemById = async (req, res) => {
  try {
    const item = await LibraryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new item
exports.createItem = async (req, res) => {
  try {
    const { title, description, type, category, author, durationOrPages, content } = req.body;
    
    // Files are handled by multer middleware in the route
    const imageUrl = req.files['image'] ? `/uploads/${req.files['image'][0].filename}` : '';
    const fileUrl = req.files['file'] ? `/uploads/${req.files['file'][0].filename}` : '';

    const newItem = new LibraryItem({
      title,
      description,
      type,
      category,
      author,
      durationOrPages,
      imageUrl,
      fileUrl,
      content
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    const { title, description, type, category, author, durationOrPages, content } = req.body;
    const item = await LibraryItem.findById(req.params.id);
    
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.title = title || item.title;
    item.description = description || item.description;
    item.type = type || item.type;
    item.category = category || item.category;
    item.author = author || item.author;
    item.durationOrPages = durationOrPages || item.durationOrPages;
    item.content = content || item.content;

    if (req.files['image']) {
      // Delete old image if exists
      // const oldPath = path.join(__dirname, '..', item.imageUrl);
      // if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      item.imageUrl = `/uploads/${req.files['image'][0].filename}`;
    }

    if (req.files['file']) {
      // Delete old file if exists
      item.fileUrl = `/uploads/${req.files['file'][0].filename}`;
    }

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const item = await LibraryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Optional: Delete files from disk
    // if (item.imageUrl) ...
    // if (item.fileUrl) ...

    await LibraryItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Increment view
exports.viewItem = async (req, res) => {
  try {
    const item = await LibraryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    item.views += 1;
    await item.save();
    res.json({ views: item.views });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Like item
exports.likeItem = async (req, res) => {
  try {
    const item = await LibraryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    item.likes += 1;
    await item.save();
    res.json({ likes: item.likes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
