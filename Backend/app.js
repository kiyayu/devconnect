// app.js
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());
 
app.use(cors({ origin: "https://devconnect-w1w6.onrender.com" }));

// Rest
 app.use("/uploads", express.static("uploads"));

 
// Import Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
 
const messageRoutes = require("./routes/messageRoutes");
const questionRoutes = require("./routes/questionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const fileRoutes = require("./routes/fileRoutes");
const reactionRoutes = require("./routes/reactionRoutes");
const groupRoutes = require("./routes/groupRoutes")
const userSettingsRoutes = require("./routes/userSettingsRoutes");
const tagRoutes = require("./routes/tagRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");
 
 
// Use Routes 
 
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
 
app.use("/api/messages", messageRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/files", fileRoutes); // File routes for uploading and managing files
app.use("/api/reactions", reactionRoutes);
app.use("/api" , groupRoutes)
app.use("/api/user-settings", userSettingsRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/activity-logs", activityLogRoutes);

// Global Error Handler (Optional but recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

module.exports = app;
