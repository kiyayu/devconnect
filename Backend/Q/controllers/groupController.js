const Group = require("../models/group")
const path = require("path")
// Create Group
const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
 
    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }
    const picture = req.picture? path.join("uplads", req.file.filename):"null"

    // Get admin ID from authenticated user
    const admin = req.userId;

    // Create a new group with admin and initialize members as an array
    const newGroup = new Group({
      name,
      admin,
      members: [admin], // Initialize with admin as a member
    });

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

module.exports = { createGroup, getAllGroups };
