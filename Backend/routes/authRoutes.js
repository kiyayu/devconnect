const express = require("express");
const {
  createUser,
  userLogin,
  getUserById,
  userProfile,
  updateUserProfile,
  getAllUsers,
  getOnlineUsers,
 getAdminDashboardData,
 getUserDashboardData, getMe
} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware"); // Ensure you have a protect middleware for authentication
const profileUpload = require("../middleware/profileUpload");
const checkRole = require("../middleware/authorize")
const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post("/register", profileUpload.single("profilePicture"), createUser);
router.get("/me", protect, getMe)
// @desc    Login a user
// @route   POST /api/auth/login
// @access  Public
router.post("/login", userLogin);
  
// @desc    Get user by ID
// @route   GET /api/auth/users/:userId
// @access  Private
router.get("/users/:userId", protect, getUserById);

// @desc    Get authenticated user's profile
// @route   GET /api/auth/profile
// @access  Private
router.get("/profile", protect, userProfile);

// @desc    Update authenticated user's profile
// @route   PUT /api/auth/profile
// @access  Private
router.put(
  "/updateProfile",
  protect,
  profileUpload.single("profilePicture"),
  updateUserProfile
);

// @desc    Get all users excluding the authenticated user
// @route   GET /api/auth/users
// @access  Private
router.get("/users", protect, getAllUsers);

// @desc    Get all online users excluding the authenticated user
// @route   GET /api/auth/online
// @access  Private
router.get("/online", protect, getOnlineUsers);

// @desc    Get all online users excluding the authenticated user
// @route   GET /api/auth/dashboard
// @access  Private
router.get("/dashboard", protect, getUserDashboardData);
router.get(
  "/admin-dashboard",
  protect, getAdminDashboardData
);
module.exports = router;
 