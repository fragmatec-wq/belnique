const Artwork = require('../models/Artwork');
const logActivity = require('../utils/activityLogger');
const path = require('path');

const fs = require('fs');

// Get all artworks
exports.getArtworks = async (req, res) => {
  try {
    const { type, search } = req.query;
    let query = {};
    
    if (type && type !== 'all') {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Admin filtering or public filtering
    if (req.query.approvalStatus) {
        query.approvalStatus = req.query.approvalStatus;
    }

    const artworks = await Artwork.find(query)
      .populate('artist', 'name profileImage')
      .sort({ createdAt: -1 });
    res.json(artworks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create artwork
exports.createArtwork = async (req, res) => {
  try {
    const { title, description, type, price, artistId, isFeatured, approvalStatus, category } = req.body;
    
    // Handle multiple files
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const newArtwork = new Artwork({
      title,
      description,
      type,
      category: category || 'Outro',
      price: Number(price),
      currentBid: type === 'auction' ? Number(price) : 0,
      artist: artistId,
      images,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      approvalStatus: approvalStatus || 'pending'
    });

    const savedArtwork = await newArtwork.save();

    await logActivity({
      user: artistId,
      action: 'ARTWORK_CREATE',
      details: `New artwork created: ${savedArtwork.title}`,
      targetId: savedArtwork._id
    });

    res.status(201).json(savedArtwork);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update artwork
exports.updateArtwork = async (req, res) => {
  try {
    const { title, description, type, price, approvalStatus, isFeatured, category } = req.body;
    const artwork = await Artwork.findById(req.params.id);

    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });

    if (title) artwork.title = title;
    if (description) artwork.description = description;
    if (type) artwork.type = type;
    if (category) artwork.category = category;
    if (price !== undefined) artwork.price = Number(price);
    
    if (approvalStatus) artwork.approvalStatus = approvalStatus;
    
    if (isFeatured !== undefined) {
      artwork.isFeatured = isFeatured === 'true' || isFeatured === true;
    }

    // Handle new images if uploaded (append or replace? usually replace or add specific logic, here we append for simplicity or replace if specified)
    // For this simple implementation, if new images are sent, we might want to replace.
    // However, the admin panel might just want to update text.
    // Let's say if files are provided, we add them. 
    // To delete images would require more logic. For now let's just allow adding.
    if (req.files && req.files.length > 0) {
       const newImages = req.files.map(file => `/uploads/${file.filename}`);
       // artwork.images = [...artwork.images, ...newImages]; // Append
       artwork.images = newImages; // Replace for simplicity in this admin flow (or user would have to re-upload all)
    }

    const updatedArtwork = await artwork.save();
    
    await logActivity({
      user: req.user ? req.user._id : null,
      action: 'ARTWORK_UPDATE',
      details: `Artwork updated: ${updatedArtwork.title}`,
      targetId: updatedArtwork._id
    });

    res.json(updatedArtwork);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// View artwork
exports.viewArtwork = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    
    artwork.views += 1;
    await artwork.save();
    res.json({ views: artwork.views });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Like artwork
exports.likeArtwork = async (req, res) => {
  try {
    const { userId } = req.body;
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    
    const index = artwork.likes.indexOf(userId);
    if (index === -1) {
      artwork.likes.push(userId);
    } else {
      artwork.likes.splice(index, 1);
    }

    await artwork.save();
    res.json(artwork.likes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Comment artwork
exports.commentArtwork = async (req, res) => {
  try {
    const { text, userId } = req.body;
    const artwork = await Artwork.findById(req.params.id)
      .populate('comments.user', 'name profileImage');
    
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });

    const newComment = {
      text,
      user: userId,
      createdAt: new Date()
    };

    artwork.comments.push(newComment);
    await artwork.save();
    
    // Re-populate to return full comment data
    const updatedArtwork = await Artwork.findById(req.params.id)
      .populate('comments.user', 'name profileImage');

    res.json(updatedArtwork.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Place Bid
exports.placeBid = async (req, res) => {
  try {
    const { amount, userId } = req.body;
    const artwork = await Artwork.findById(req.params.id);
    
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    if (artwork.type !== 'auction') return res.status(400).json({ message: 'Not an auction' });
    if (amount <= artwork.currentBid) return res.status(400).json({ message: 'Bid must be higher than current bid' });

    artwork.currentBid = amount;
    artwork.bids.push({ bidder: userId, amount });
    
    await artwork.save();
    res.json({ currentBid: artwork.currentBid, bids: artwork.bids });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Buy Artwork
exports.buyArtwork = async (req, res) => {
  try {
    const { userId } = req.body;
    const artwork = await Artwork.findById(req.params.id);
    
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    if (artwork.type !== 'sale') return res.status(400).json({ message: 'Not for sale' });
    if (artwork.status === 'sold') return res.status(400).json({ message: 'Already sold' });

    artwork.status = 'sold';
    // In a real app, we would process payment and record ownership transfer here
    
    await artwork.save();
    res.json({ status: 'sold' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteArtwork = async (req, res) => {
  try {
    await Artwork.findByIdAndDelete(req.params.id);
    res.json({ message: 'Artwork deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
