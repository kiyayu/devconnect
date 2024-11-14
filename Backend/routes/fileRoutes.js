// routes/fileRoutes.js

const express = require("express");
const {
  uploadFile,
  getFileById,
  deleteFile,
  getFilesByUser,
} = require("../controllers/fileController");
const protect = require("../middleware/authMiddleware"); // Ensure to create an auth middleware for protection
const upload = require("../middleware/upload")
const router = express.Router();  
// multerConfig.js or profileUpload.js
 


// @desc    Upload a file
// @route   POST /api/files/upload
// @access  Private
router.post("/upload", protect, upload.single("file"), uploadFile);

// @desc    Get file by ID
// @route   GET /api/files/:id
// @access  Private
router.get("/:id", getFileById);

// @desc    Delete a file by ID
// @route   DELETE /api/files/:id
// @access  Private (Only the uploader or admins can delete)
router.delete("/:id", protect, deleteFile);

// @desc    Get all files uploaded by a user
// @route   GET /api/files/user/:userId
// @access  Private (Assuming)
router.get("/user/:userId", protect, getFilesByUser);

module.exports = router;
