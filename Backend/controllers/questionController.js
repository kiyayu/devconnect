// controllers/questionController.js

const Question = require("../models/Question");
const Tag = require("../models/Tag");
const Reaction = require("../models/Reaction");
const mongoose = require("mongoose");
const User = require("../models/User")
const Notification = require("../models/Notification")

/**
 * @desc    Create a new question with tags
 * @route   POST /api/questions
 * @access  Private
 */
const createQuestion = async (req, res) => {
  const { title, body, tags } = req.body; // Expect tags as an array of Tag IDs

  if (!title || !body) {
    return res.status(400).json({ message: "Title and body are required." });
  }

  try {
    // Validate tags if provided
    let validTags = [];
    if (tags && tags.length > 0) {
      validTags = await Tag.find({ _id: { $in: tags } });
      if (validTags.length !== tags.length) {
        return res
          .status(400)
          .json({ message: "One or more tags are invalid." });
      }
    }

    const newQuestion = new Question({
      title,
      body,
      author: req.userId,
      tags: tags || [],
      user:req.userId,
    });
const notification = new Notification({
  user: req.userId,
  type:"question",
  contentSummary:title,

});
await notification.save()
    await newQuestion.save();

    const populatedQuestion = await Question.findById(newQuestion._id)
      .populate("author", "name profilePicture")
      .populate("tags", "name description");
      
    res.status(201).json(populatedQuestion);
  } catch (error) {
    console.error("Error in createQuestion:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


/**
 * @desc    Get all questions with tags and reactions
 * @route   GET /api/questions
 * @access  Public
 */
const getAllQuestions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      search = '',
      tag = '',
      sortBy = 'upvotes', // Default sort by upvotes
      sortOrder = 'desc'  // Default sort order
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build base query
    let query = Question.find();

    // Apply search filter if provided
    if (search) {
      query = query.or([
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } }
      ]);
    }

    // Apply tag filter if provided
    if (tag) {
      query = query.where('tags').in([tag]);
    }

    // Build sort object
    let sortObject = {};
    switch (sortBy) {
      case 'upvotes':
        sortObject['reactionCounts.upvote'] = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'date':
        sortObject['createdAt'] = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'views':
        sortObject['viewCount'] = sortOrder === 'desc' ? -1 : 1;
        break;
      default:
        sortObject['reactionCounts.upvote'] = -1;
    }

    // Execute main query
    const questions = await query
      .populate('author', 'name profilePicture role')
      .populate('tags', 'name description')
      .sort(sortObject)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Question.countDocuments(query.getQuery());

    // Fetch reactions for all questions in one query
    const questionIds = questions.map(q => q._id);
    const reactions = await Reaction.find({
      onModel: 'Question',
      on: { $in: questionIds }
    })
      .populate('user', 'name profilePicture')
      .lean();

    // Organize reactions by question ID
    const reactionsByQuestion = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.on]) {
        acc[reaction.on] = [];
      }
      acc[reaction.on].push({
        type: reaction.type,
        user: reaction.user,
        _id: reaction._id,
        createdAt: reaction.createdAt
      });
      return acc;
    }, {});

    // Attach reactions to questions and calculate additional metrics
    const questionsWithReactions = questions.map(question => {
      const questionReactions = reactionsByQuestion[question._id] || [];
      
      // Calculate reaction counts
      const reactionCounts = {
        upvote: 0,
        downvote: 0,
        bookmark: 0
      };
      
      questionReactions.forEach(reaction => {
        if (reactionCounts.hasOwnProperty(reaction.type)) {
          reactionCounts[reaction.type]++;
        }
      });

      return {
        ...question,
        reactions: questionReactions,
        reactionCounts,
        reactionCount: questionReactions.length,
      };
    });

    // Prepare pagination info
    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalQuestions: total,
      hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
      hasPrevPage: parseInt(page) > 1
    };

    res.status(200).json({
      success: true,
      pagination,
      questions: questionsWithReactions,
      message: 'Questions retrieved successfully'
    });

  } catch (error) {
    console.error('Error in getAllQuestions:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving questions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

/**
 * @desc    Get a single question by ID with tags and reactions
 * @route   GET /api/questions/:id
 * @access  Public or Private based on your preference
 */
const getQuestionById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid question ID" });
  }

  try {
    // Fetch question with author, tags, and answers populated
    const question = await Question.findById(id)
      .populate("author", "name profilePicture")
      .populate("tags", "name description")
      .populate({
        path: "answers",
        populate: { path: "author", select: "name profilePicture" }, // Populate answer authors
      })
      .lean();

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Sort answers by combined count of upvotes and hearts
    question.answers = question.answers.sort((a, b) => {
      const aReactions = a.reactionCounts.upvote + a.reactionCounts.heart;
      const bReactions = b.reactionCounts.upvote + b.reactionCounts.heart;
      return bReactions - aReactions; // Sort in descending order
    });

    // Fetch reactions for this question
    const reactions = await Reaction.find({
      onModel: "Question",
      on: id,
    }).populate("user", "name profilePicture");

    question.reactions = reactions.map((r) => ({
      type: r.type,
      user: r.user,
      _id: r._id,
    }));

    res.status(200).json(question);
  } catch (error) {
    console.error("Error in getQuestionById:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


/**
 * @desc    Update a question
 * @route   PUT /api/questions/:id
 * @access  Private (Only the author or admins)
 */
const updateQuestion = async (req, res) => {
  const { id } = req.params;
  const { title, body, tags } = req.body;
    const userId = req.userId;
    const user = await User.findById(userId);

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid question ID" });
  }

  
  try {
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Check if the authenticated user is the author or an admin
    if (
      question.author.toString() !== req.userId.toString() &&
      user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this question" });
    }

    // Update fields if provided
    if (title) question.title = title;
    if (body) question.body = body;

    if (tags) {
      // Validate tags
      const validTags = await Tag.find({ _id: { $in: tags } });
      if (validTags.length !== tags.length) {
        return res
          .status(400)
          .json({ message: "One or more tags are invalid." });
      }
      question.tags = tags;
    }

    await question.save();

    const populatedQuestion = await Question.findById(id)
      .populate("author", "name profilePicture")
      .populate("tags", "name description");

    res.status(200).json(populatedQuestion);
  } catch (error) {
    console.error("Error in updateQuestion:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Delete a question
 * @route   DELETE /api/questions/:id
 * @access  Private (Only the author or admins)
 */
const deleteQuestion = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId
  const user =  await User.findById(userId)
  
  

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid question ID" });
  }

  try {
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Check if the authenticated user is the author or an admin
    if (
      question.author.toString() !== req.userId.toString() &&
      user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this question" });
    }

    await Question.findByIdAndDelete(question);

    res.status(200).json({ message: "Question successfully deleted" });
  } catch (error) {
    console.error("Error in deleteQuestion:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Add an answer to a question
 * @route   POST /api/questions/:id/answers
 * @access  Private
 */
/**
 * @desc    Add an answer to a question 
 * @route   POST /api/questions/:id/answers
 * @access  Protected
 */



const addAnswer = async (req, res) => {
  const { id } = req.params; // Question ID
  const { body } = req.body;

  if (!body) {
    return res.status(400).json({ message: "Answer body is required" });
  }

  try {
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const newAnswer = {
      body,
      author: req.userId,
      question: id, // **Add this line**
    };

    // Handle file upload
    if (req.file) {
      newAnswer.file = req.file ? req.file.path : null; // Add profilePicture to updates// Normalize path
    }

    question.answers.push(newAnswer);
    question.answerCount += 1;

    await question.save();

    const populatedQuestion = await Question.findById(id)
      .populate("author", "name profilePicture")
      .populate("tags", "name description")
      .populate("answers.author", "name profilePicture");

    res.status(201).json(populatedQuestion);
  } catch (error) {
    console.error("Error in addAnswer:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Update an answer
 * @route   PUT /api/questions/:questionId/answers/:answerId
 * @access  Protected (Only the author can update)
 */
const updateAnswer = async (req, res) => {
  const { questionId, answerId } = req.params;
  const { body } = req.body;

  if (!body) {
    return res.status(400).json({ message: "Answer body is required" });
  }

  if (
    !mongoose.isValidObjectId(questionId) ||
    !mongoose.isValidObjectId(answerId)
  ) {
    return res.status(400).json({ message: "Invalid question or answer ID" });
  }

  try {
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const answer = question.answers.id(answerId);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    // Check if the authenticated user is the author of the answer
    if (answer.author.toString() !== req.userId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this answer" });
    }

    // Update answer body
    answer.body = body;

    await question.save();

    const updatedQuestion = await Question.findById(questionId)
      .populate("author", "name profilePicture role")
      .populate("answers.author", "name profilePicture role");

    res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error("Error in updateAnswer:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Delete an answer from a question
 * @route   DELETE /api/questions/:questionId/answers/:answerId
 * @access  Protected (Only the author of the answer or admins can delete)
 */
const deleteAnswer = async (req, res) => {
  const { questionId, answerId } = req.params;
  const user = await User.findById(req.userId);
  
  if (
    !mongoose.isValidObjectId(questionId) ||
    !mongoose.isValidObjectId(answerId)
  ) {
    return res.status(400).json({ message: "Invalid question or answer ID" });
  }

  try {
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const answer = question.answers.id(answerId);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    // Check if the authenticated user is the author of the answer or has admin role
    if (
      answer.author.toString() !== req.userId.toString() &&
      user.role !== "admin"
    ) {  
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this answer" });
    }

    // Remove the answer
    await answer.deleteOne()
    question.answerCount -= 1;

    await question.save();

    res.status(200).json({ message: "Answer successfully deleted" });
  } catch (error) {
    console.error("Error in deleteAnswer:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Reply to an answer
 * @route   POST /api/questions/:questionId/answers/:answerId/replies
 * @access  Protected
 */
const replyToAnswer = async (req, res) => {
  const { body } = req.body;
  const { questionId, answerId } = req.params;

  if (!body) {
    return res.status(400).json({ message: "Reply body is required" });
  }

  if (
    !mongoose.isValidObjectId(questionId) ||
    !mongoose.isValidObjectId(answerId)
  ) {
    return res.status(400).json({ message: "Invalid question or answer ID" });
  }

  try {
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const answer = question.answers.id(answerId);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    // Add reply
    const newReply = {
      body,
      author: req.userId,
    };
    answer.replies.push(newReply);

    await question.save();

    const populatedQuestion = await Question.findById(questionId)
      .populate("author", "name profilePicture role")
      .populate("answers.author", "name profilePicture role")
      .populate("answers.replies.author", "name profilePicture role");

    res.status(201).json(populatedQuestion);
  } catch (error) {
    console.error("Error in replyToAnswer:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Update a reply to an answer
 * @route   PUT /api/questions/:questionId/answers/:answerId/replies/:replyId
 * @access  Protected (Only the author of the reply can update)
 */
const updateReply = async (req, res) => {
  const { questionId, answerId, replyId } = req.params;
  const { body } = req.body;

  if (!body) {
    return res.status(400).json({ message: "Reply body is required" });
  }

  if (
    !mongoose.isValidObjectId(questionId) ||
    !mongoose.isValidObjectId(answerId) ||
    !mongoose.isValidObjectId(replyId)
  ) {
    return res.status(400).json({ message: "Invalid IDs provided" });
  }

  try {
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const answer = question.answers.id(answerId);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const reply = answer.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    // Check if the authenticated user is the author of the reply
    if (reply.author.toString() !== req.userId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this reply" });
    }

    // Update reply body
    reply.body = body;

    await question.save();

    const updatedQuestion = await Question.findById(questionId)
      .populate("author", "name profilePicture role")
      .populate("answers.author", "name profilePicture role")
      .populate("answers.replies.author", "name profilePicture role");

    res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error("Error in updateReply:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Delete a reply from an answer
 * @route   DELETE /api/questions/:questionId/answers/:answerId/replies/:replyId
 * @access  Protected (Only the author of the reply or admins can delete)
 */
const deleteReply = async (req, res) => {
  const { questionId, answerId, replyId } = req.params;

  if (
    !mongoose.isValidObjectId(questionId) ||
    !mongoose.isValidObjectId(answerId) ||
    !mongoose.isValidObjectId(replyId)
  ) {
    return res.status(400).json({ message: "Invalid IDs provided" });
  }

  try {
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const answer = question.answers.id(answerId);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const reply = answer.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    // Check if the authenticated user is the author of the reply or has admin role
    if (
      reply.author.toString() !== req.userId.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this reply" });
    }

    // Remove the reply
    reply.remove();

    await question.save();

    res.status(200).json({ message: "Reply successfully deleted" });
  } catch (error) {
    console.error("Error in deleteReply:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  addAnswer,
  updateAnswer,
  deleteAnswer,
  replyToAnswer,
  updateReply,
  deleteReply,
};
