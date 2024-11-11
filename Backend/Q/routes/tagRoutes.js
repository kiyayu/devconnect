// routes/tagRoutes.js

const express = require("express");
const {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
} = require("../controllers/tagController");
const protect = require("../middleware/authMiddleware"); // Authentication middleware
const authorize = require("../middleware/authorize"); // Authorization middleware
const router = express.Router();

// @desc    Get all tags
// @route   GET /api/tags
// @access  Public
router.get("/", getAllTags);

// @desc    Get a single tag by ID
// @route   GET /api/tags/:id
// @access  Public
router.get("/:id", getTagById);

// @desc    Create a new tag
// @route   POST /api/tags
// @access  Private (Only admins)
router.post("/", protect, authorize("admin"), createTag);

// @desc    Update an existing tag
// @route   PUT /api/tags/:id
// @access  Private (Only admins)
router.put("/:id", protect, authorize("admin"), updateTag);

// @desc    Delete a tag
// @route   DELETE /api/tags/:id
// @access  Private (Only admins)
router.delete("/:id", protect, authorize("admin"), deleteTag);

module.exports = router;
