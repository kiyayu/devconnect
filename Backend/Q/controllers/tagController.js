// controllers/tagController.js

const Tag = require("../models/Tag");
const mongoose = require("mongoose");

/**
 * @desc    Get all tags
 * @route   GET /api/tags
 * @access  Public
 */
const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 }); // Sort tags alphabetically
    res.status(200).json(tags);
  } catch (error) {
    console.error("Error in getAllTags:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Get a single tag by ID
 * @route   GET /api/tags/:id
 * @access  Public
 */
const getTagById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid tag ID" });
  }

  try {
    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    res.status(200).json(tag);
  } catch (error) {
    console.error("Error in getTagById:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Create a new tag
 * @route   POST /api/tags
 * @access  Private (Only admins or authorized users)
 */
const createTag = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Tag name is required" });
  }

  try {
    const newTag = new Tag({ name });
    await newTag.save();

    res.status(201).json(newTag);
  } catch (error) {
    console.error("Error in createTag:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Update an existing tag
 * @route   PUT /api/tags/:id
 * @access  Private (Only admins or authorized users)
 */
const updateTag = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid tag ID" });
  }

  try {
    const updatedTag = await Tag.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true } // Return the updated document and apply validators
    );

    if (!updatedTag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    res.status(200).json(updatedTag);
  } catch (error) {
    console.error("Error in updateTag:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Delete a tag
 * @route   DELETE /api/tags/:id
 * @access  Private (Only admins or authorized users)
 */
const deleteTag = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid tag ID" });
  }

  try {
    const tag = await Tag.findByIdAndDelete(id);
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    res.status(200).json({ message: "Tag successfully deleted" });
  } catch (error) {
    console.error("Error in deleteTag:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
};
