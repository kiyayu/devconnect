// controllers/activityLogController.js

const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");
const mongoose = require("mongoose");

/**
 * @desc    Log user activity
 * @route   POST /api/activity-log
 * @access  Private
 */
const logActivity = async (req, res) => {
  const { action, details } = req.body;

  if (!action) {
    return res.status(400).json({ message: "Action is required" });
  }

  try {
    const activityLog = new ActivityLog({
      user: req.user._id,
      action,
      details,
    });

    await activityLog.save();
    res
      .status(201)
      .json({ message: "Activity logged successfully", activityLog });
  } catch (error) {
    console.error("Error in logActivity:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get user activity logs
 * @route   GET /api/users/:id/activity-log
 * @access  Private
 */
const getUserActivityLogs = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const logs = await ActivityLog.find({ user: id })
      .populate("user", "name profilePicture")
      .sort({ createdAt: -1 });

    if (!logs.length) {
      return res
        .status(404)
        .json({ message: "No activity logs found for this user" });
    }

    res.status(200).json(logs);
  } catch (error) {
    console.error("Error in getUserActivityLogs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Clear user activity logs
 * @route   DELETE /api/users/:id/activity-log
 * @access  Private
 */
const clearUserActivityLogs = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  if (id !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "You can only clear your own activity logs" });
  }

  try {
    await ActivityLog.deleteMany({ user: id });
    res.status(200).json({ message: "Activity logs cleared successfully" });
  } catch (error) {
    console.error("Error in clearUserActivityLogs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  logActivity,
  getUserActivityLogs,
  clearUserActivityLogs,
};
