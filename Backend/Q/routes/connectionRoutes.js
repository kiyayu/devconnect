const express = require("express");
const {
  getAllConnections,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} = require("../controllers/connectionController");
const protect = require("../middleware/authMiddleware"); // Ensure you have a protect middleware for authentication
const router = express.Router();

// @desc    Get all connections (followers and following) for a user
// @route   GET /api/users/:id/connections
// @access  Private
router.get("/:id/connections", protect, getAllConnections);

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
router.post("/:id/follow", protect, followUser);

// @desc    Unfollow a user
// @route   DELETE /api/users/:id/unfollow
// @access  Private
router.delete("/:id/unfollow", protect, unfollowUser);

// @desc    Get followers of the user
// @route   GET /api/users/:id/followers
// @access  Private
router.get("/:id/followers", protect, getFollowers);

// @desc    Get users followed by the user
// @route   GET /api/users/:id/following
// @access  Private
router.get("/:id/following", protect, getFollowing);

module.exports = router;
