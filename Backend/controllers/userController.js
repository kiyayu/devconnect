// controllers/userController.js

const User = require("../models/User");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Login a user
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserProfile = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/:id
 * @access  Private
 */
const updateUserProfile = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  if (id !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Unauthorized to update this profile" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Delete user account
 * @route   DELETE /api/users/:id
 * @access  Private
 */
const deleteUserAccount = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  if (id !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Unauthorized to delete this account" });
  }

  try {
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUserAccount:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try{
    const user = await User.find()
    res.json(user)
  }
  catch (error) {
    console.error("error", error)
  }
}

module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
};
