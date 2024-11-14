// controllers/fileController.js

const File = require("../models/File");
const mongoose = require("mongoose");

/**
 * @desc    Upload a file
 * @route   POST /api/files/upload
 * @access  Private
 */
const uploadFile = async (req, res) => {
  const { groupId, messageId } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const newFile = new File({
      filename: file.filename,
      url: req.file ? req.file.path : null,// Add profilePicture to updates`, // Adjust based on your static folder
      uploader: req.userId,
      group: groupId || null,
      message: messageId || null,
      fileType: file.mimetype.split("/")[0], // Simplistic approach
      size: file.size,
    });

    await newFile.save();

    res.status(201).json(newFile);
  } catch (error) {
    console.error("Error in uploadFile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get file by ID
 * @route   GET /api/files/:id
 * @access  Private (assuming)
 */
const getFileById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid file ID" });
  }

  try {
    const file = await File.findById(id).populate("uploader", "name email");

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Optional: Check if the user has access to the file
    // For example, if it's linked to a group, ensure the user is a member

    res.status(200).json(file);
  } catch (error) {
    console.error("Error in getFileById:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Delete a file by ID
 * @route   DELETE /api/files/:id
 * @access  Private (Only the uploader or admins can delete)
 */
const deleteFile = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid file ID" });
  }

  try {
    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check if the user is the uploader or an admin
    const isUploader = file.uploader.equals(req.user._id);
    const isAdmin = req.user.role === "admin"; // Assuming 'role' field exists

    if (!isUploader && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this file" });
    }

    // Delete the file from storage if necessary
    // For example, using fs to delete from the filesystem
    // const fs = require('fs');
    // fs.unlinkSync(`uploads/${file.filename}`);

    await file.remove();

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error in deleteFile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get all files uploaded by a user
 * @route   GET /api/files/user/:userId
 * @access  Private (assuming)
 */
const getFilesByUser = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    // Optional: Ensure the requesting user is the same as userId or an admin
    if (userId !== req.user._id.toString() && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized to view these files" });
    }

    const files = await File.find({ uploader: userId });

    res.status(200).json(files);
  } catch (error) {
    console.error("Error in getFilesByUser:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  uploadFile,
  getFileById,
  deleteFile,
  getFilesByUser,
};
