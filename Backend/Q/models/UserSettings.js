const mongoose = require("mongoose");

const UserSettingsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Ensures one settings document per user
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
    },
    language: {
      type: String,
      default: "en",
    },
    // Add more preference fields as needed
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserSettings", UserSettingsSchema);
