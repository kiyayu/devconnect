// controllers/reactionController.js
const Reaction = require("../models/Reaction");
const Question = require("../models/Question");
const mongoose = require("mongoose");

/**
 * @desc    React to an entity (Question or Answer)
 * @route   POST /api/reactions
 * @access  Private
 */
// controllers/reactionController.js
const updateAnswerRewardPoints = async (answerId, type) => {
  try {
    const question = await Question.findOne({ "answers._id": answerId });
    if (!question) return;

    const answer = question.answers.id(answerId);
    if (!answer) return;

    // Update reward points based on reaction type
    if (type === "upvote") {
      answer.rewardPoints += 10; // 10 points for upvote
    } else if (type === "heart") {
      answer.rewardPoints += 5; // 5 points for heart
    }

    await question.save();
  } catch (error) {
    console.error("Error updating reward points:", error);
  }
};
const reactToEntity = async (req, res) => {
  const { onModel, on, type } = req.body;

  // Validate inputs
  if (!onModel || !on || !type) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (!["Question", "Answer"].includes(onModel)) {
    return res.status(400).json({ message: "Invalid onModel type." });
  }

  if (!["upvote", "heart"].includes(type)) {
    return res.status(400).json({ message: "Invalid reaction type." });
  }

  if (!mongoose.isValidObjectId(on)) {
    return res.status(400).json({ message: "Invalid ID for 'on' field." });
  }

  try {
    // Check if reaction exists
    const existingReaction = await Reaction.findOne({
      user: req.userId,
      onModel,
      on,
      type,
    });

    const rewardPointsChange = type === "upvote" ? 10 : 5; // Reward points by reaction type

    if (existingReaction) {
      // Remove the reaction (toggle off)
      await Reaction.deleteOne({ _id: existingReaction._id });

      // Decrement the reaction count and reward points
      if (onModel === "Question") {
        await Question.findByIdAndUpdate(on, {
          $inc: { [`reactionCounts.${type}`]: -1 },
        });
      } else if (onModel === "Answer") {
        await Question.updateOne(
          { "answers._id": on },
          {
            $inc: {
              [`answers.$.reactionCounts.${type}`]: -1,
              [`answers.$.rewardPoints`]: -rewardPointsChange,
            },
          }
        );
      }

      return res
        .status(200)
        .json({ message: "Reaction removed successfully." });
    } else {
      // Create a new reaction
      const newReaction = new Reaction({
        user: req.userId,
        onModel,
        on,
        type,
      });
      await newReaction.save();

      // Increment the reaction count and reward points
      if (onModel === "Question") {
        await Question.findByIdAndUpdate(on, {
          $inc: { [`reactionCounts.${type}`]: 1 },
        });
      } else if (onModel === "Answer") {
        await Question.updateOne(
          { "answers._id": on },
          {
            $inc: {
              [`answers.$.reactionCounts.${type}`]: 1,
              [`answers.$.rewardPoints`]: rewardPointsChange,
            },
          }
        );
      }

      return res.status(201).json({ message: "Reaction added successfully." });
    }
  } catch (error) {
    console.error("Error in reactToEntity:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


/**
 * @desc    Get all reactions for an entity (Question or Answer)
 * @route   GET /api/reactions?onModel=Question&on=<questionId>
 * @access  Private
 */
const getReactions = async (req, res) => {
  const { onModel, on } = req.query;

  if (!onModel || !on) {
    return res.status(400).json({ message: "onModel and on are required." });
  }

  if (!["Question", "Answer"].includes(onModel)) {
    return res.status(400).json({ message: "Invalid onModel type." });
  }

  if (!mongoose.isValidObjectId(on)) {
    return res.status(400).json({ message: "Invalid ID for 'on' field." });
  }

  try {
    const reactions = await Reaction.find({ onModel, on }).populate(
      "user",
      "name profilePicture"
    );
    res.status(200).json(reactions);
  } catch (error) {
    console.error("Error in getReactions:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Delete a reaction from an entity (Question or Answer)
 * @route   DELETE /api/reactions/:id
 * @access  Private
 */
const deleteReaction = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid reaction ID." });
  }

  try {
    const reaction = await Reaction.findById(id);
    if (!reaction) {
      return res.status(404).json({ message: "Reaction not found." });
    }

    // Check if the reaction belongs to the user
    if (reaction.user.toString() !== req.userId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this reaction." });
    }

    // Decrement the reaction count before removing
    const { onModel, on, type } = reaction;

    if (onModel === "Question") {
      await Question.findByIdAndUpdate(on, {
        $inc: { [`reactionCounts.${type}`]: -1 },
      });
    } else if (onModel === "Answer") {
      await Question.updateOne(
        { "answers._id": on },
        { $inc: { [`answers.$.reactionCounts.${type}`]: -1 } }
      );
    }

    await Reaction.deleteOne(reaction);

    res.status(200).json({ message: "Reaction removed successfully." });
  } catch (error) {
    console.error("Error in deleteReaction:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  reactToEntity,
  getReactions,
  deleteReaction,
};
