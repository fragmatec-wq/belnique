const ConferenceMessage = require('../models/ConferenceMessage');

exports.getMessages = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const messages = await ConferenceMessage.find({ lessonId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { content, senderName, senderRole } = req.body;

    const message = new ConferenceMessage({
      lessonId,
      content,
      senderName,
      senderRole
    });

    const savedMessage = await message.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
