const Channel = require('../models/Channel');
const Post = require('../models/Post');
const Message = require('../models/Message');
const fs = require('fs');
const path = require('path');

// Channels
exports.getChannels = async (req, res) => {
  try {
    const channels = await Channel.find().sort({ createdAt: 1 });
    res.json(channels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createChannel = async (req, res) => {
  try {
    const { name, description, type, isPrivate, allowedRoles, userId, status } = req.body;
    
    const newChannel = new Channel({
      name,
      description,
      type: type || 'feed',
      status: status || 'open',
      isPrivate: isPrivate || false,
      allowedRoles: allowedRoles || [],
      createdBy: userId
    });

    const savedChannel = await newChannel.save();
    res.status(201).json(savedChannel);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateChannel = async (req, res) => {
  try {
    const { name, description, type, isPrivate, allowedRoles, status } = req.body;
    const channel = await Channel.findById(req.params.id);
    
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    
    if (name) channel.name = name;
    if (description) channel.description = description;
    if (type) channel.type = type;
    if (status) channel.status = status;
    if (isPrivate !== undefined) channel.isPrivate = isPrivate;
    if (allowedRoles) channel.allowedRoles = allowedRoles;
    
    const updatedChannel = await channel.save();
    res.json(updatedChannel);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });
    
    await Channel.deleteOne({ _id: req.params.id });
    res.json({ message: 'Channel removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Posts
exports.getPosts = async (req, res) => {
  try {
    const { channelId } = req.query;
    let query = {};
    if (channelId) {
      query.channel = channelId;
    }

    const posts = await Post.find(query)
      .populate('author', 'name profileImage role')
      .populate('comments.author', 'name profileImage')
      .sort({ createdAt: -1 });
      
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { content, channelId, userId } = req.body;
    
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const newPost = new Post({
      content,
      imageUrl,
      channel: channelId,
      author: userId
    });

    const savedPost = await newPost.save();
    const populatedPost = await Post.findById(savedPost._id)
      .populate('author', 'name profileImage role');
      
    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const index = post.likes.indexOf(userId);
    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json(post.likes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.commentPost = async (req, res) => {
  try {
    const { text, userId } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = {
      text,
      author: userId,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    const updatedPost = await Post.findById(req.params.id)
      .populate('comments.author', 'name profileImage');
      
    res.json(updatedPost.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Messages
exports.getMessages = async (req, res) => {
  try {
    const { channelId } = req.query;
    if (!channelId) return res.status(400).json({ message: 'Channel ID required' });
    
    const messages = await Message.find({ channel: channelId })
      .populate('author', 'name profileImage')
      .sort({ createdAt: 1 }); // Oldest first for chat history
      
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createMessage = async (req, res) => {
  try {
    const { content, channelId, userId } = req.body;
    
    const newMessage = new Message({
      content,
      channel: channelId,
      author: userId
    });
    
    const savedMessage = await newMessage.save();
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('author', 'name profileImage');
      
    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
