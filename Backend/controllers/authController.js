const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");
const mongoose = require("mongoose");
const Question = require("../models/Question");

const getMe = async (req, res) =>{
  try{
    const userId = req.userId;
    const user = await User.findById(userId)
     res.json(user)
  }
  catch (error) {
    console.log("error", error)
  }
}
/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public 
 */
const createUser = async (req, res) => {
  try {
    const { name, email, password, age, phone, address } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required fields" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Get the profile picture file path, storing relative path
      const profilePicture = req.file ? req.file.path : null; // Cloudinary URL

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      age: age || null, // Optional fields
      phone: phone || null,
      address: address || null,
      profilePicture, // store the relative path
    });
  
    await newUser.save();
      
    res.status(200).json({ message: "User Registerd!" });
     
  } catch (error) {
    console.error("Error in createUser:", error);
    res.status(500).json({ message: "Server error" });
  } 
};

/**
 * @desc    Login a user
 * @route   POST /api/auth/login
 * @access  Public
 */
const userLogin = async (req, res) => {
  try {
    const { name, password } = req.body;

    // Find the user by name
    const user = await User.findOne({ name });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Set user online and update status
    user.isOnline = true;
    user.status = "online";
    await user.save();

    // Generate a JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        profilePicture: user.profilePicture,
        phone: user.phone, // New fields
        address: user.address,
        role: user.role,
        status: user.status,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Logged in", token });
  } catch (error) {
    console.error("Error in userLogin:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/auth/users/:userId
 * @access  Private
 */
const getUserById = async (req, res) => {
  const userId = req.params.userId;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error in getUserById:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * @desc    Get authenticated user's profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const userProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error in userProfile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Update authenticated user's profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
// controllers/authController.js
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const updates = { ...req.body };

    if (req.file) {
      updates.profilePicture = req.file ? req.file.path : null; // Add profilePicture to updates
    }

    // Remove null/undefined values
    Object.keys(updates).forEach(
      (key) =>
        (updates[key] === undefined ||
          updates[key] === "" ||
          updates[key] === null) &&
        delete updates[key]
    );

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password"); // Exclude password from response

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
/**
 * @desc    Get all online users excluding the authenticated user
 * @route   GET /api/auth/users
 * @access  Private
 */
const getOnlineUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id }, // Exclude authenticated user
      status: "online", // Only online users
    }).select("name email profilePicture status");

    res.json({ users });
  } catch (error) {
    console.error("Error fetching online users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get all users excluding the authenticated user
 * @route   GET /api/auth/users/all
 * @access  Private
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()

    res.json(users); 
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Server error" });
  }
}; 

/**
 * @desc    Add a friend 
 * @route   POST /api/auth/friends/add
 * @access  Private
 */
const addFriend = async (req, res) => {
  try {
    const userId = req.user._id;
    const { friendId } = req.body;

    if (!mongoose.isValidObjectId(friendId)) {
      return res.status(400).json({ message: "Invalid friend ID" });
    }  

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }

    if (!user.friends.includes(friendId)) {
      user.friends.push(friendId);
      await user.save();
      res.status(200).json({ message: "Friend added" });
    } else {
      res.status(400).json({ message: "Friend already added" });
    }
  } catch (error) {
    console.error("Error adding friend:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// controllers/dashboardController.js
// User dashboard controller
const getUserDashboardData = async (req, res) => {
  try {
    const userId = req.userId;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's questions with populated answers
    const userQuestions = await Question.find({ author: userId }).populate("author","name profilePicture");
  
    // Get answers written by the user on other questions
    const answersOnOtherQuestions = await Question.find({
      "answers.author": userId,
    }).populate("author", "name profilePicture")
    // all user questions
     
    // all user answers
    
    // Extract user's answers from other questions
    const userAnswers = answersOnOtherQuestions.reduce((acc, question) => {
      const userAnswersInQuestion = question.answers.filter(
        (answer) => answer.author.toString() === userId
      );
      return [...acc, ...userAnswersInQuestion];
    }, []);
     const allAnswersInUserQuestions = userQuestions.reduce((acc, question) => {
       return [...acc, ...question.answers];
     }, []);
    // Calculate statistics
    const questionsPosted = userQuestions.length;
    const totalAnswers = userAnswers.length;

    const questionUpvotes = userQuestions.reduce(
      (total, question) => total + (question.reactionCounts?.upvote || 0),
      0
    );
    const questionHearts = userQuestions.reduce(
      (total, question) => total + (question.reactionCounts?.heart || 0),
      0
    );
    const answerUpvotes = userAnswers.reduce(
      (total, answer) => total + (answer.reactionCounts?.upvote || 0),
      0
    );
    const answerHearts = userAnswers.reduce(
      (total, answer) => total + (answer.reactionCounts?.heart || 0),
      0
    );

    // New: Activity timeline
    const activityTimeline = [
      ...userQuestions.map((q) => ({
        type: "question",
        content: q.title,
        date: q.createdAt,
        reactions: q.reactionCounts,
      })),
      ...userAnswers.map((a) => ({
        type: "answer",
        content: a.body,
        date: a.createdAt,
        reactions: a.reactionCounts,
        rewardPoints: a.rewardPoints,
      })),
    ].sort((a, b) => b.date - a.date);

    // Format recent activity for front end
    const recentQuestions = userQuestions
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map((q) => ({
        _id: q._id,
        title: q.title,
        createdAt: q.createdAt,
        reactionCounts: q.reactionCounts,
      }));

    const recentAnswers = userAnswers
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map((a) => ({
        body: a.body,
        createdAt: a.createdAt,
        reactionCounts: a.reactionCounts,
        rewardPoints: a.rewardPoints,
      }));

    res.json({
      allAnswers: allAnswersInUserQuestions,
      allQuestions: userQuestions,
      userStats: {
        totalQuestions: questionsPosted,
        totalAnswers,
        totalUpvotes: questionUpvotes + answerUpvotes,
        totalHearts: questionHearts + answerHearts,
        totalRewardPoints: userAnswers.reduce(
          (total, answer) => total + (answer.rewardPoints || 0),
          0
        ),
      },
      recentActivity: {
        questions: recentQuestions,
        answers: recentAnswers,
      },
      activityTimeline, // New field for displaying all recent activity
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Error retrieving dashboard data" });
  }
};


// Admin dashboard controller
const getAdminDashboardData = async (req, res) => {
  try {
    // Get overall platform statistics
    const totalUsers = await User.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const userId = req.userId;
    // Get questions with populated data
    const questions = await Question.find()
      .populate("author", "name profilePicture")
      .populate("answers.author", "name profilePicture")
      .lean();

    const totalAnswers = questions.reduce(
      (total, question) => total + question.answers.length,
      0
    );
   const allUsers = await User.find().select(
     "name email profilePicture questionCount answerCount totalReactions rewardPoints"
   );

    // Get all questions with populated data
    const allQuestions = await Question.find()
      .populate("author", "name profilePicture")
      .populate("answers.author", "name profilePicture")
      .lean();

    // Get all answers from all questions
    const allAnswers = allQuestions.reduce((acc, question) => {
      return [...acc, ...question.answers];
    }, []);

    // Calculate user statistics
    const userStats = await Promise.all(
      (
        await User.find().select("name profilePicture").lean()
      ).map(async (user) => {
        const userQuestions = await Question.find({ author: userId });
        const questionsWithUserAnswers = await Question.find({
          "answers.author": userId,
        });

        const userAnswers = questionsWithUserAnswers.reduce((acc, question) => {
          return [
            ...acc,
            ...question.answers.filter(
              (answer) => answer.author.toString() === userId.toString()
            ),
          ];
        }, []);

        return {
          _id: userId,
          name: user.name,
          profilePicture: user.profilePicture,
          questionCount: userQuestions.length,
          answerCount: userAnswers.length,
          totalPoints: userAnswers.reduce(
            (total, answer) => total + (answer.rewardPoints || 0),
            0
          ),
        };
      })
    );

    // Sort users by different metrics
    const topQuestioners = [...userStats]
      .sort((a, b) => b.questionCount - a.questionCount)
      .slice(0, 5);
    const topAnswerers = [...userStats]
      .sort((a, b) => b.answerCount - a.answerCount)
      .slice(0, 5);
    const topPointEarners = [...userStats]
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 5);

    res.json({
      allUsers,
      allQuestions,
      allAnswers,
      platformStats: {
        totalUsers,
        totalQuestions,
        totalAnswers,
      },
      topContributors: {
        byQuestions: topQuestioners,
        byAnswers: topAnswerers,
        byPoints: topPointEarners,
      },
      recentQuestions: questions
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5)
        .map((q) => ({
          _id: q._id,
          title: q.title,
          author: q.author,
          createdAt: q.createdAt,
          answerCount: q.answers.length,
          reactionCounts: q.reactionCounts,
        })),
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    res.status(500).json({ message: "Error retrieving admin dashboard data" });
  }
};
 
module.exports = {
  createUser,
  getUserDashboardData,
  getAdminDashboardData,
  userLogin,
  getUserById,
  userProfile,
  updateUserProfile,
  getOnlineUsers,
  getAllUsers,
  addFriend,
  getMe,
};
