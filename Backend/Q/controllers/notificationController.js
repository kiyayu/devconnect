const Notification = require("../models/Notification");
const mongoose = require("mongoose");

/**
 * @desc Get all notifications for the logged-in user
 * @route GET /api/notifications
 * @access Private
 */
const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name profilePicture")
    

    const total = await Notification.countDocuments({ user: req.userId });

    res.status(200).json({
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    });
  } catch (error) {
    console.error("Error in getNotifications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Mark all notifications as read for the logged-in user
 * @route POST /api/notifications/read
 * @access Private
 */
const markNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.userId, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Error in markNotificationsAsRead:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Delete a notification
 * @route DELETE /api/notifications/:id
 * @access Private
 */
const deleteNotification = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid notification ID" });
  }

  try {
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Check if the authenticated user is the owner of the notification
    if (notification.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this notification" });
    }

    await Notification.findByIdAndDelete(id);
    res.status(200).json({ message: "Notification successfully deleted" });
  } catch (error) {
    console.error("Error in deleteNotification:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getNotifications,
  deleteNotification,
  markNotificationsAsRead,
};
