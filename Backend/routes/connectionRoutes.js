const express = require("express");
const router = express.Router();
const {
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  blockUser,
  getFriends,
  getPendingRequests,
  getSentRequests,
  getBlockedUsers,getConnectionStatus, getMutualFriends, getUserActivity, 
} = require("../controllers/connectionController");

// Middleware for authentication (assuming you have an auth middleware)
const authMiddleware = require("../middleware/authMiddleware");

// Routes
// Send a friend request
router.post("/:id/request", authMiddleware, sendFriendRequest);

// Accept a friend request
router.post("/:id/accept", authMiddleware, acceptFriendRequest);

// Remove a friend
router.delete("/:id/remove", authMiddleware, removeFriend);

// Block a user
router.post("/:id/block", authMiddleware, blockUser);

// Get friends list
router.get("/:id/friends", authMiddleware, getFriends);

// Get pending friend requests
router.get("/requests/pending", authMiddleware, getPendingRequests);

// Get sent friend requests
router.get("/:id/requests/sent", authMiddleware, getSentRequests);

// Get blocked users
router.get("/:id/blocked", authMiddleware, getBlockedUsers);
router.get("/:id/status", authMiddleware, getConnectionStatus);
router.get("/:id/mutual-friends", authMiddleware, getMutualFriends);
router.get("/:id/activity", authMiddleware, getUserActivity);

module.exports = router;
