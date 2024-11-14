const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activityType: {
      type: String,
      enum: [
        "login",
        "logout",
        "post_created",
        "message_sent",
        "profile_updated",
      ],
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed, // Stores additional details about the activity
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
