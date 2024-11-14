// models/Question.js
const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    body: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Removed the 'question' field
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    hearts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    rewardPoints: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    file: { type: String },
    // Removed 'reactions' array as we will use the Reaction model
    reactionCounts: {
      upvote: { type: Number, default: 0 },
      heart: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: [answerSchema],
    answerCount: { type: Number, default: 0 },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    // Removed 'reactions' array as we will use the Reaction model
    reactionCounts: {
      upvote: { type: Number, default: 0 },
      heart: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);
module.exports = Question;
