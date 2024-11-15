const Group = require("../models/group")
const User = require("../models/User")
const path = require("path")
// Create Group
const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
 
    if (!name) { 
      return res.status(400).json({ message: "Group name is required" });
    }
    const groupIcon = req.file ? req.file.path : null;

    // Get admin ID from authenticated user  
    const admin = req.userId;

    // Create a new group with admin and initialize members as an array
    const newGroup = new Group({
      name, 
      admin,
      members: [admin], 
      groupIcon, 
    });
  console.log(newGroup)
    await newGroup.save(); // Save the new group

    res.status(201).json({ message: "Group created", newGroup });
  } catch (error) {
    console.error("Error creating group", error);
    res.status(500).json({ message: "Error creating group", error });
  }
};


// Get All Groups
const getAllGroups = async (req, res) => {
  try {
    const allGroups = await Group.find()
      .populate("admin", "name profilePicture") // Populate admin details
      .populate("members", "name profilePicture") // Populate members' details
      .lean(); // Use lean() for better performance

    res.status(200).json(allGroups);
  } catch (error) {
    console.error("Error fetching all groups", error);
    res.status(500).json({ message: "Error fetching all groups", error });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params; // Get group ID from the request
    const userId = req.userId; // Get user ID from the authenticated user

    // Fetch the group by ID
    const group = await Group.findById(id);

    // Check if the group exists
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if the user is authorized to delete the group
    if (group.admin.toString() !== userId.toString()) {
      const user = await User.findById(userId);
      if (!user || user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Unauthorized to delete this group" });
      }
    }
 
    // Delete the group
    await Group.findByIdAndDelete(id);
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({ message: "Error deleting group", error });
  }
};

module.exports = { createGroup, getAllGroups, deleteGroup };
