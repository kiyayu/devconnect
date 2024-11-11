const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: false, // Allows either group or message to be optional
    },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: false, // Allows either group or message to be optional
    },
    fileType: {
      type: String,
      enum: ["pdf", "image", "video", "audio"],
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", FileSchema);
