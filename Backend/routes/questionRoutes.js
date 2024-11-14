const express = require("express");
const {
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
} = require("../controllers/questionController");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/upload")
const router = express.Router();

// @desc    Get all questions
// @route   GET /api/questions
// @access  Protected
router.get("/", protect, getAllQuestions);

// @desc    Get a single question by ID
// @route   GET /api/questions/:id
// @access  Protected
router.get("/:id", protect, getQuestionById);

// @desc    Create a new question
// @route   POST /api/questions
// @access  Protected
router.post("/", protect, createQuestion);

// @desc    Update a question by ID
// @route   PUT /api/questions/:id
// @access  Protected
router.put("/:id", protect, updateQuestion);

// @desc    Delete a question by ID
// @route   DELETE /api/questions/:id
// @access  Protected
router.delete("/:id", protect, deleteQuestion);

// @desc    Add an answer to a question
// @route   POST /api/questions/:id/answers
// @access  Protected
router.post("/:id/answers", protect, upload.single("file"), addAnswer);

// @desc    Update an answer
// @route   PUT /api/questions/:questionId/answers/:answerId
// @access  Protected
router.put("/:questionId/answers/:answerId", protect, updateAnswer);

// @desc    Delete an answer from a question
// @route   DELETE /api/questions/:questionId/answers/:answerId
// @access  Protected
router.delete("/:questionId/answers/:answerId", protect, deleteAnswer);

// @desc    Reply to an answer
// @route   POST /api/questions/:questionId/answers/:answerId/replies
// @access  Protected
router.post("/:questionId/answers/:answerId/replies", protect, replyToAnswer);

// @desc    Update a reply
// @route   PUT /api/questions/:questionId/answers/:answerId/replies/:replyId
// @access  Protected
router.put(
  "/:questionId/answers/:answerId/replies/:replyId",
  protect,
  updateReply
);

// @desc    Delete a reply
// @route   DELETE /api/questions/:questionId/answers/:answerId/replies/:replyId
// @access  Protected
router.delete(
  "/:questionId/answers/:answerId/replies/:replyId",
  protect,
  deleteReply
);

module.exports = router;
