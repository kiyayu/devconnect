// controllers/messageController.js

const Message = require("../models/Message");
const  Group = require("../models/group");
const mongoose = require("mongoose");

/**
 * @desc    Send a new message in a conversation
 * @route   POST /api/conversations/:conversationId/messages
 * @access  Private
 */
const sendMessage = async (req, res) => {
  const { conversationId } = req.params;
  const { text } = req.body;
  let attachment = null;

  // Handle file upload if present
  if (req.file) { 
    // Assuming you're using middleware like multer for file uploads
    attachment = req.file.path; // Or the URL/path to the uploaded file
  }

  if (!mongoose.isValidObjectId(conversationId)) {
    return res.status(400).json({ message: "Invalid conversation ID" });
  }

  if (!text && !attachment) {
    return res
      .status(400)
      .json({ message: "Message text or attachment is required" });
  }

  try {
    // Check if the conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Ensure the user is part of the conversation
    const isMember = conversation.members.some((member) =>
      member.user.equals(req.user._id)
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this conversation" });
    }

    // Determine message type
    let messageType = "text";
    if (attachment) {
      const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp"];
      const fileExtension = attachment.split(".").pop().toLowerCase();
      if (imageExtensions.includes(`.${fileExtension}`)) {
        messageType = "image";
      } else {
        messageType = "file";
      }
    }

    // Create a new message
    const newMessage = new Message({
      conversation: conversationId,
      sender: req.user._id,
      text: text || "",
      messageType,
      attachment,
    });

    await newMessage.save();

    // Update the conversation's last message field
    conversation.lastMessage = newMessage._id;
    await conversation.save();

    // Populate sender's info in the message
    await newMessage.populate("sender", "name profilePicture");

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get all messages in a conversation
 * @route   GET /api/conversations/:conversationId/messages
 * @access  Private
 */
const getMessages = async (req, res) => {
  const { conversationId } = req.params;

  if (!mongoose.isValidObjectId(conversationId)) {
    return res.status(400).json({ message: "Invalid conversation ID" });
  }

  try {
    // Check if the conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Ensure the user is part of the conversation
    const isMember = conversation.members.some((member) =>
      member.user.equals(req.user._id)
    );
    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this conversation" });
    }

    // Get all messages for the conversation
    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "name profilePicture")
      .sort({ createdAt: 1 }); // Sort by oldest first

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Update a message
 * @route   PUT /api/messages/:messageId
 * @access  Private (Only the sender can update their message)
 */
const updateMessage = async (req, res) => {
  const { messageId } = req.params;
  const { text } = req.body;

  if (!mongoose.isValidObjectId(messageId)) {
    return res.status(400).json({ message: "Invalid message ID" });
  }

  if (!text) {
    return res.status(400).json({ message: "Message text is required" });
  }

  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if the user is the sender of the message
    if (!message.sender.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: "You are not allowed to edit this message" });
    }

    // Update the message text
    message.text = text;

    // Optionally, update the messageType if needed
    // For example, if the text now includes an attachment or changes the type

    await message.save();

    // Populate sender's info
    await message.populate("sender", "name profilePicture");

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in updateMessage:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Delete a message
 * @route   DELETE /api/messages/:messageId
 * @access  Private (Only the sender can delete)
 */
const deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  if (!mongoose.isValidObjectId(messageId)) {
    return res.status(400).json({ message: "Invalid message ID" });
  }

  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if the user is the sender of the message
    if (!message.sender.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: "You are not allowed to delete this message" });
    }

    await message.remove();

    // Optionally, update the conversation's last message if needed
    const conversation = await Conversation.findById(message.conversation);
    if (conversation.lastMessage.equals(messageId)) {
      const latestMessage = await Message.findOne({
        conversation: conversation._id,
      })
        .sort({ createdAt: -1 })
        .exec();
      conversation.lastMessage = latestMessage ? latestMessage._id : null;
      await conversation.save();
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMessage:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    React to a message (optional feature)
 * @route   POST /api/messages/:messageId/react
 * @access  Private
 */
const reactToMessage = async (req, res) => {
  const { messageId } = req.params;
  const { reaction } = req.body; // E.g., "like", "love", "laugh"

  if (!mongoose.isValidObjectId(messageId)) {
    return res.status(400).json({ message: "Invalid message ID" });
  }

  if (!reaction) {
    return res.status(400).json({ message: "Reaction is required" });
  }

  const validReactions = ["like", "love", "laugh"];
  if (!validReactions.includes(reaction)) {
    return res.status(400).json({ message: "Invalid reaction type" });
  }

  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if the user has already reacted with this type
    const existingReaction = message.reactions.find(
      (r) => r.user.equals(req.user._id) && r.type === reaction
    );

    if (existingReaction) {
      // If already reacted, remove the reaction (toggle off)
      message.reactions = message.reactions.filter(
        (r) => !(r.user.equals(req.user._id) && r.type === reaction)
      );
    } else {
      // Add the reaction
      message.reactions.push({ user: req.user._id, type: reaction });
    }

    await message.save();

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in reactToMessage:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  updateMessage,
  deleteMessage,
  reactToMessage,
};
