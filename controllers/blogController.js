const Article = require('../models/Article');
const logActivity = require('../utils/activityLogger');


// Get all articles
exports.getArticles = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const articles = await Article.find(filter)
      .populate('author', 'name profileImage')
      .sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create article
exports.createArticle = async (req, res) => {
  try {
    const { title, content, category, userId, status, isFeatured } = req.body;
    
    let coverImage = '';
    if (req.file) {
      coverImage = `/uploads/${req.file.filename}`;
    }

    const newArticle = new Article({
      title,
      content,
      category,
      coverImage,
      author: userId,
      status: status || 'pending',
      isFeatured: isFeatured === 'true' || isFeatured === true
    });

    const savedArticle = await newArticle.save();
    const populatedArticle = await Article.findById(savedArticle._id).populate('author', 'name profileImage');
    
    await logActivity({
      user: userId,
      action: 'ARTICLE_CREATE',
      details: `New article created: ${savedArticle.title}`,
      targetId: savedArticle._id
    });

    res.status(201).json(populatedArticle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update article
exports.updateArticle = async (req, res) => {
  try {
    const { title, content, category, status, isFeatured } = req.body;
    const article = await Article.findById(req.params.id);

    if (!article) return res.status(404).json({ message: 'Article not found' });

    if (title) article.title = title;
    if (content) article.content = content;
    if (category) article.category = category;
    if (status) article.status = status;
    
    if (isFeatured !== undefined) {
      article.isFeatured = isFeatured === 'true' || isFeatured === true;
    }

    if (req.file) {
      article.coverImage = `/uploads/${req.file.filename}`;
    }

    const updatedArticle = await article.save();
    const populatedArticle = await Article.findById(updatedArticle._id).populate('author', 'name profileImage');

    await logActivity({
      user: req.user ? req.user._id : null,
      action: 'ARTICLE_UPDATE',
      details: `Article updated: ${updatedArticle.title}`,
      targetId: updatedArticle._id
    });

    res.json(populatedArticle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Upload inline image (for rich text editor)
exports.uploadInlineImage = (req, res) => {
  if (req.file) {
    res.json({ url: `/uploads/${req.file.filename}` });
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
};

// Delete article
exports.deleteArticle = async (req, res) => {
  try {
    // Only allow author or admin (check in frontend or middleware, simplistic here)
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });
    
    // In a real app, verify req.user._id === article.author or req.user.role === 'admin'
    
    await Article.findByIdAndDelete(req.params.id);

    await logActivity({
      user: req.user ? req.user._id : null, // Assuming req.user is available via middleware
      action: 'ARTICLE_DELETE',
      details: `Article deleted: ${article.title}`,
      targetId: article._id
    });

    res.json({ message: 'Article deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Like article
exports.likeArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    const { userId } = req.body;

    if (!article) return res.status(404).json({ message: 'Article not found' });

    if (article.likes.includes(userId)) {
      article.likes = article.likes.filter(id => id.toString() !== userId);
    } else {
      article.likes.push(userId);
    }

    await article.save();
    res.json(article.likes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Comment on article
exports.commentArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    const { text, userId } = req.body;

    if (!article) return res.status(404).json({ message: 'Article not found' });

    const newComment = {
      text,
      user: userId,
      createdAt: new Date()
    };

    article.comments.push(newComment);
    await article.save();
    
    const updatedArticle = await Article.findById(req.params.id)
      .populate('comments.user', 'name profileImage');
      
    res.json(updatedArticle.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Increment view
exports.viewArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id, 
      { $inc: { views: 1 } },
      { new: true }
    );
    res.json({ views: article.views });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
