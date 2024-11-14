// routes/messageRoutes.js

const express = require("express");
const {
  sendMessage,
  getMessages,
  updateMessage,
  deleteMessage,
  reactToMessage,
} = require("../controllers/messageController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Route for sending a new message
router.post("/conversations/:conversationId/messages", protect, sendMessage);

// Route for getting messages in a conversation
router.get("/conversations/:conversationId/messages", protect, getMessages);

// Route for updating a message
router.put("/messages/:messageId", protect, updateMessage);

// Route for deleting a message
router.delete("/messages/:messageId", protect, deleteMessage);

// Route for reacting to a message
router.post("/messages/:messageId/react", protect, reactToMessage);

module.exports = router;
