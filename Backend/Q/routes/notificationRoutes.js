const express = require("express");
const {
  getNotifications,
  createNotification,
  markNotificationAsRead,
  deleteNotification,
  markNotificationsAsRead,
} = require("../controllers/notificationController");
const protect = require("../middleware/authMiddleware");// Ensure to create an auth middleware for protection
const router = express.Router();

// @desc    Get all notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
router.get("/", protect, getNotifications);
 

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete("/:id", protect, deleteNotification);

router.post("/read", protect, markNotificationsAsRead);

module.exports = router;
