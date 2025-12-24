const SiteContent = require('../models/SiteContent');
const Course = require('../models/Course');
const Artwork = require('../models/Artwork');
const User = require('../models/User');

// @desc    Get content by section
// @route   GET /api/content/:section
// @access  Public
const getContent = async (req, res) => {
  try {
    const { section } = req.params;
    let content = await SiteContent.findOne({ section });
    
    if (!content) {
      // Return default empty structure or null if not found
      // We can also initialize defaults here if we want
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all content
// @route   GET /api/content
// @access  Public
const getAllContent = async (req, res) => {
  try {
    const content = await SiteContent.find({});
    // Convert array to object keyed by section for easier frontend consumption
    const contentMap = content.reduce((acc, item) => {
      acc[item.section] = item.content;
      return acc;
    }, {});
    
    // Dynamic Stats Calculation
    try {
      const courseCount = await Course.countDocuments({});
      const artworkCount = await Artwork.countDocuments({ approvalStatus: 'approved' });
      
      // Get unique artists (users with approved artworks)
      const artistIds = await Artwork.distinct('artist', { approvalStatus: 'approved' });
      // Get professors (users with role 'professor')
      const professors = await User.countDocuments({ role: 'professor' });
      
      // Combine unique count (approximation: artists + professors, logic can be refined)
      // For now, let's use the larger of the two or just artistIds length if we want "Artistas"
      // Or maybe count all users with role 'professor' OR 'artist' (if exists).
      // Let's stick to unique artwork creators + professors who might not have artworks yet.
      // Ideally we would do a distinct query on User IDs.
      // Simplified: Count distinct 'artist' in Artworks.
      let artistCount = artistIds.length;
      if (artistCount === 0) artistCount = professors; // Fallback to professors if no artworks

      contentMap.stats = {
        artists: `${artistCount}+`,
        courses: `${courseCount}+`,
        artworks: `${artworkCount}+`
      };
    } catch (statsError) {
      console.error('Error calculating stats:', statsError);
      // Fallback to existing stats or defaults if calc fails
      if (!contentMap.stats) {
        contentMap.stats = { artists: '0+', courses: '0+', artworks: '0+' };
      }
    }
    
    res.json(contentMap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update content section
// @route   PUT /api/content/:section
// @access  Private/Admin
const updateContent = async (req, res) => {
  try {
    const { section } = req.params;
    const { content } = req.body;

    let siteContent = await SiteContent.findOne({ section });

    if (siteContent) {
      siteContent.content = content;
      siteContent.lastUpdated = Date.now();
      siteContent.updatedBy = req.user._id;
      await siteContent.save();
    } else {
      siteContent = await SiteContent.create({
        section,
        content,
        updatedBy: req.user._id
      });
    }

    res.json(siteContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getContent,
  getAllContent,
  updateContent
};
