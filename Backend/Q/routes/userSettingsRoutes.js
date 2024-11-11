const express = require("express");
const {
  getUserSettings,
  updateUserSettings,
  changePassword,
  deleteAccount,
} = require("../controllers/userSettingsController");
const protect = require("../middleware/authMiddleware");// Ensure you have a protect middleware for authentication
const router = express.Router();

// @desc    Get user settings
// @route   GET /api/user/settings
// @access  Private
router.get("/", protect, getUserSettings);

// @desc    Update user settings
// @route   PUT /api/user/settings
// @access  Private
router.put("/", protect, updateUserSettings);

// @desc    Change user password
// @route   PUT /api/user/settings/change-password
// @access  Private
router.put("/change-password", protect, changePassword);

// @desc    Delete user account
// @route   DELETE /api/user/settings/delete-account
// @access  Private
router.delete("/delete-account", protect, deleteAccount);

module.exports = router;
