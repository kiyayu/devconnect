const mongoose = require("mongoose");
const User = require("../models/User");
const Connection = require("../models/Connection");

/**
 * @desc Send a friend request
 * @route POST /api/users/:id/request
 * @access Private
 */
const sendFriendRequest = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    if (id === req.userId.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot add yourself as a friend" });
    }

    const existingConnection = await Connection.findOne({
      requester: req.userId,
      receiver: id,
    });

    if (existingConnection) {
      return res.status(400).json({
        message: "Friend request already sent or user is already your friend",
      });
    }

    const newConnection = await Connection.create({
      requester: req.userId,
      receiver: id,
      status: "pending",
    });

    res.status(200).json({
      message: "Friend request sent successfully",
      connection: newConnection,
    });
  } catch (error) {
    console.error("Error in sendFriendRequest:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Accept a friend request
 * @route POST /api/users/:id/accept
 * @access Private
 */
const acceptFriendRequest = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const connection = await Connection.findOne({
      requester: id,
      receiver: req.userId,
      status: "pending",
    });

    if (!connection) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    connection.status = "accepted";
    await connection.save();

    res.status(200).json({ message: "Friend request accepted successfully" });
  } catch (error) {
    console.error("Error in acceptFriendRequest:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Remove a friend
 * @route DELETE /api/users/:id/remove
 * @access Private
 */
const removeFriend = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const connection = await Connection.findOneAndDelete({
      $or: [
        { requester: req.userId, receiver: id },
        { requester: id, receiver: req.userId },
      ],
      status: "accepted",
    });

    if (!connection) {
      return res.status(404).json({ message: "Friendship not found" });
    }

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Error in removeFriend:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Block a user
 * @route POST /api/users/:id/block
 * @access Private
 */
const blockUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const connection = await Connection.findOne({
      $or: [
        { requester: req.userId, receiver: id },
        { requester: id, receiver: req.userId },
      ],
    });

    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }

    connection.status = "blocked";
    await connection.save();

    res.status(200).json({ message: "User blocked successfully" });
  } catch (error) {
    console.error("Error in blockUser:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get friends list
 * @route GET /api/users/:id/friends
 * @access Private
 */
const getFriends = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const friends = await Connection.find({
      $or: [
        { requester: id, status: "accepted" },
        { receiver: id, status: "accepted" },
      ],
    })
      .populate("requester", "name profilePicture")
      .populate("receiver", "name profilePicture");

    const friendList = friends.map((connection) =>
      connection.requester._id.toString() === id
        ? connection.receiver
        : connection.requester
    );

    res.status(200).json(friendList);
  } catch (error) {
    console.error("Error in getFriends:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get pending friend requests
 * @route GET /api/users/:id/requests/pending
 * @access Private
 */
const getPendingRequests = async (req, res) => {
  const userId = req.userId
 

  try {
    const requests = await Connection.find({
      receiver: userId,
      status: "pending",
    }).populate("requester", "name profilePicture");

    res.status(200).json(requests.map((connection) => connection.requester));
  } catch (error) {
    console.error("Error in getPendingRequests:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get sent friend requests
 * @route GET /api/users/:id/requests/sent
 * @access Private
 */
const getSentRequests = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const sentRequests = await Connection.find({
      requester: id,
      status: "pending",
    }).populate("receiver", "name profilePicture");

    res.status(200).json(sentRequests.map((connection) => connection.receiver));
  } catch (error) {
    console.error("Error in getSentRequests:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get blocked users
 * @route GET /api/users/:id/blocked
 * @access Private
 */
const getBlockedUsers = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const blockedConnections = await Connection.find({
      $or: [
        { requester: id, status: "blocked" },
        { receiver: id, status: "blocked" },
      ],
    })
      .populate("requester", "name profilePicture")
      .populate("receiver", "name profilePicture");

    const blockedUsers = blockedConnections.map((connection) =>
      connection.requester._id.toString() === id
        ? connection.receiver
        : connection.requester
    );

    res.status(200).json(blockedUsers);
  } catch (error) {
    console.error("Error in getBlockedUsers:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


/**
 * @desc Get connection status between two users
 * @route GET /api/connections/:id/status
 * @access Private
 */
const getConnectionStatus = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const connection = await Connection.findOne({
      $or: [
        { requester: req.userId, receiver: id },
        { requester: id, receiver: req.userId },
      ],
    });

    if (!connection) {
      return res.json({ status: "none" });
    }

    res.json({ status: connection.status });
  } catch (error) {
    console.error("Error in getConnectionStatus:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get mutual friends between two users
 * @route GET /api/users/:id/mutual-friends
 * @access Private
 */
const getMutualFriends = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    // Get current user's friends
    const userFriends = await Connection.find({
      $or: [
        { requester: req.userId, status: "accepted" },
        { receiver: req.userId, status: "accepted" },
      ],
    });

    // Get target user's friends
    const targetUserFriends = await Connection.find({
      $or: [
        { requester: id, status: "accepted" },
        { receiver: id, status: "accepted" },
      ],
    });

    // Extract friend IDs for both users
    const userFriendIds = userFriends.map(conn => 
      conn.requester.toString() === req.userId.toString() 
        ? conn.receiver.toString() 
        : conn.requester.toString()
    );

    const targetUserFriendIds = targetUserFriends.map(conn =>
      conn.requester.toString() === id
        ? conn.receiver.toString()
        : conn.requester.toString()
    );

    // Find mutual friend IDs
    const mutualFriendIds = userFriendIds.filter(id => 
      targetUserFriendIds.includes(id)
    );

    // Get mutual friends' details
    const mutualFriends = await User.find(
      { _id: { $in: mutualFriendIds } },
      'name profilePicture'
    );

    res.json({ mutualFriends });
  } catch (error) {
    console.error("Error in getMutualFriends:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc Get user's recent activity
 * @route GET /api/users/:id/activity
 * @access Private
 */
const getUserActivity = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    // Get recent connections (friend requests, acceptances)
    const recentConnections = await Connection.find({
      $or: [{ requester: id }, { receiver: id }],
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    })
    .populate('requester', 'name')
    .populate('receiver', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

    const activity = recentConnections.map(conn => ({
      type: conn.status === 'pending' ? 'friend_request' : 'friend_accepted',
      user: conn.requester._id.toString() === id ? conn.receiver : conn.requester,
      timestamp: conn.createdAt
    }));

    res.json({ activity });
  } catch (error) {
    console.error("Error in getUserActivity:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  blockUser,
  getFriends,
  getPendingRequests,
  getSentRequests,
  getBlockedUsers,
  getConnectionStatus,
  getMutualFriends,
  getUserActivity,
};
