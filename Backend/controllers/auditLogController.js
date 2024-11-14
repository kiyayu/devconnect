// controllers/auditLogController.js

const AuditLog = require("../models/AuditLog");
const mongoose = require("mongoose");

/**
 * @desc    Get all audit logs
 * @route   GET /api/audit-logs
 * @access  Private (Admin access)
 */
const getAllAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("user", "name") // Populate user information
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json(logs);
  } catch (error) {
    console.error("Error in getAllAuditLogs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Create a new audit log
 * @route   POST /api/audit-logs
 * @access  Private (Admin access)
 */
const createAuditLog = async (req, res) => {
  const { action, description } = req.body;

  if (!action || !description) {
    return res
      .status(400)
      .json({ message: "Action and description are required" });
  }

  try {
    const newLog = new AuditLog({
      action,
      description,
      user: req.user._id, // The user performing the action
    });

    await newLog.save();

    res.status(201).json(newLog);
  } catch (error) {
    console.error("Error in createAuditLog:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Delete an audit log
 * @route   DELETE /api/audit-logs/:id
 * @access  Private (Admin access)
 */
const deleteAuditLog = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid audit log ID" });
  }

  try {
    const log = await AuditLog.findById(id);
    if (!log) {
      return res.status(404).json({ message: "Audit log not found" });
    }

    await AuditLog.findByIdAndDelete(id);

    res.status(200).json({ message: "Audit log successfully deleted" });
  } catch (error) {
    console.error("Error in deleteAuditLog:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllAuditLogs,
  createAuditLog,
  deleteAuditLog,
};
