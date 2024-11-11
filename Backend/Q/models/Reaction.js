// models/Reaction.js
const mongoose = require("mongoose");

const ReactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["upvote", "heart"],
      required: true,
    },
    onModel: {
      type: String,
      required: true,
      enum: ["Question", "Answer"],
    },
    on: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "onModel",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reaction", ReactionSchema);
