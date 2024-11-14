const mongoose = require("mongoose");

const ConnectionSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "blocked"],
      default: "pending",
    },
    actionAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ensure unique connection between two users
ConnectionSchema.index({ requester: 1, receiver: 1 }, { unique: true });

module.exports = mongoose.model("Connection", ConnectionSchema);
