// controllers/userSettingsController.js

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

/**
 * @desc    Get user settings
 * @route   GET /api/user/settings
 * @access  Private
 */
const getUserSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password"); // Exclude password from the response
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserSettings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Update user settings
 * @route   PUT /api/user/settings
 * @access  Private
 */
const updateUserSettings = async (req, res) => {
  const { email, notificationPreferences } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        email,
        notificationPreferences,
      },
      { new: true, runValidators: true } // Return the updated document and apply validators
    ).select("-password"); // Exclude password from the response

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateUserSettings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/user/settings/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password successfully changed" });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Delete user account
 * @route   DELETE /api/user/settings/delete-account
 * @access  Private
 */
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Account successfully deleted" });
  } catch (error) {
    console.error("Error in deleteAccount:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getUserSettings,
  updateUserSettings,
  changePassword,
  deleteAccount,
};
