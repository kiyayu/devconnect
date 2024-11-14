const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getAllUsers,
} = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");// Ensure you have a protect middleware for authentication
const router = express.Router();

router.get("/all", protect, getAllUsers)
// @desc    Register a new user
// @route   POST /api/users/register 
// @access  Public
router.post("/register", registerUser);

// @desc    Login a user
// @route   POST /api/users/login
// @access  Public
router.post("/login", loginUser); 

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
router.get("/:id", protect, getUserProfile);

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
router.put("/:id", protect, updateUserProfile);

// @desc    Delete user account
// @route   DELETE /api/users/:id
// @access  Private
router.delete("/:id", protect, deleteUserAccount);

module.exports = router;