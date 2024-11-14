const express = require("express");
const {
  getAllAuditLogs,
  createAuditLog,
  deleteAuditLog,
} = require("../controllers/auditLogController");
const { protect, admin } = require("../middleware/authMiddleware"); // Ensure you have an admin middleware for protection
const router = express.Router();

// @desc    Get all audit logs
// @route   GET /api/audit-logs
// @access  Private (Admin access)
router.get("/", protect, getAllAuditLogs);

// @desc    Create a new audit log
// @route   POST /api/audit-logs
// @access  Private (Admin access)
router.post("/", protect, admin, createAuditLog);

// @desc    Delete an audit log
// @route   DELETE /api/audit-logs/:id
// @access  Private (Admin access)
router.delete("/:id", protect, admin, deleteAuditLog);

module.exports = router;
 