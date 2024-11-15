const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["question", "answer", "message"],
      required: true,   
    },
    contentSummary: { type: String, required: true }, // Made required
    contentLink: { type: mongoose.Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    // Added fields for better tracking
    updatedAt: { type: Date, default: Date.now },
     
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Add indexes for better query performance
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ isRead: 1 });

module.exports = mongoose.model("Notification", NotificationSchema);
