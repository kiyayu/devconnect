// controllers/connectionController.js

const User = require("../models/User");
const mongoose = require("mongoose");

/**
 * @desc    Get all connections (followers and following) for a user
 * @route   GET /api/users/:id/connections
 * @access  Private
 */
const getAllConnections = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const user = await User.findById(id)
      .populate("followers", "name profilePicture")
      .populate("following", "name profilePicture");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      followers: user.followers,
      following: user.following,
    });
  } catch (error) {
    console.error("Error in getAllConnections:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Follow a user
 * @route   POST /api/users/:id/follow
 * @access  Private
 */
const followUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    // Ensure the user is not trying to follow themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const userToFollow = await User.findById(id);
    if (!userToFollow) {
      return res.status(404).json({ message: "User to follow not found" });
    }

    // Check if already following
    if (req.user.following.includes(id)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // Add the user to the following list
    req.user.following.push(id);
    userToFollow.followers.push(req.user._id); // Add the user to the followers of the user being followed

    await req.user.save();
    await userToFollow.save();

    res.status(200).json({ message: "Successfully followed user" });
  } catch (error) {
    console.error("Error in followUser:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Unfollow a user
 * @route   DELETE /api/users/:id/unfollow
 * @access  Private
 */
const unfollowUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    // Ensure the user is not trying to unfollow themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot unfollow yourself" });
    }

    const userToUnfollow = await User.findById(id);
    if (!userToUnfollow) {
      return res.status(404).json({ message: "User to unfollow not found" });
    }

    // Check if not following
    if (!req.user.following.includes(id)) {
      return res.status(400).json({ message: "Not following this user" });
    }

    // Remove the user from the following list
    req.user.following = req.user.following.filter(
      (userId) => userId.toString() !== id
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (followerId) => followerId.toString() !== req.user._id.toString()
    );

    await req.user.save();
    await userToUnfollow.save();

    res.status(200).json({ message: "Successfully unfollowed user" });
  } catch (error) {
    console.error("Error in unfollowUser:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get followers of the user
 * @route   GET /api/users/:id/followers
 * @access  Private
 */
const getFollowers = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const user = await User.findById(id).populate(
      "followers",
      "name profilePicture"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.followers);
  } catch (error) {
    console.error("Error in getFollowers:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get users followed by the user
 * @route   GET /api/users/:id/following
 * @access  Private
 */
const getFollowing = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const user = await User.findById(id).populate(
      "following",
      "name profilePicture"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.following);
  } catch (error) {
    console.error("Error in getFollowing:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllConnections,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
