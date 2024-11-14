const express = require("express");
const {
  logActivity,
  getUserActivityLogs,
  clearUserActivityLogs,
} = require("../controllers/activityLogController");
const protect = require("../middleware/authMiddleware"); // Ensure you have a protect middleware for authentication
const router = express.Router();

// @desc    Log user activity
// @route   POST /api/activity-log
// @access  Private
router.post("/", protect, logActivity);

// @desc    Get user activity logs
// @route   GET /api/users/:id/activity-log
// @access  Private
router.get("/:id/activity-log", protect, getUserActivityLogs);

// @desc    Clear user activity logs
// @route   DELETE /api/users/:id/activity-log
// @access  Private
router.delete("/:id/activity-log", protect, clearUserActivityLogs);

module.exports = router;
