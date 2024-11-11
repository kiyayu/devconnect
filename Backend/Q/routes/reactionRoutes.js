// routes/reactionRoutes.js

const express = require("express");
const {
  reactToEntity,
  getReactions,
  deleteReaction,
} = require("../controllers/reactionController");
const protect = require("../middleware/authMiddleware"); // Authentication middleware
const router = express.Router();

// @desc    React to an entity (Question or Answer)
// @route   POST /api/reactions
// @access  Private
router.post("/", protect, reactToEntity);

// @desc    Get all reactions for an entity (Question or Answer)
// @route   GET /api/reactions?onModel=Question&on=<questionId>
// @access  Private
router.get("/", protect, getReactions);

// @desc    Delete a reaction
// @route   DELETE /api/reactions/:id
// @access  Private
router.delete("/:id", protect, deleteReaction);

module.exports = router;
