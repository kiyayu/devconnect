const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors")
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const path = require("path")
dotenv.config();

const app = require("./app");
const User = require("./models/User"); 
const Message = require("./models/Message");
const Group = require("./models/group");
const protect = require("./middleware/authMiddleware");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

 
 
// Server and Socket.io setup
const port = process.env.PORT || 5004;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://devconnect-1-imto.onrender.com"], // This is correct now
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
});
// Rest of your server code remains the same
 
 
 

const connectedUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return next(new Error("Authentication error"));
    socket.userId = decoded.userId;
    next();
  });
});

io.on("connection", async (socket) => {
  

  try {
    const user = await User.findById(socket.userId);
    if (user) {
      connectedUsers.set(socket.userId, {
        _id: socket.userId,
        name: user.name,
        profilePicture: user.profilePicture,
      });

      io.emit("updated_users", Array.from(connectedUsers.values()));
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }

  socket.on("joinRoom", async (roomId) => {
    socket.leaveAll(); // Leave all rooms
    socket.join(roomId);
 

    try {
      let messages;
      if (roomId.includes("-")) {
        // For private chats
        const [user1, user2] = roomId.split("-");
        messages = await Message.find({
          roomId,
          $or: [
            { sender: user1, receiver: user2 },
            { sender: user2, receiver: user1 },
          ],
        })
          .populate("sender", "name profilePicture")
          .sort({ createdAt: 1 });
      } else {
        // For group chats
        messages = await Message.find({ roomId })
          .populate("sender", "name profilePicture")
          .sort({ createdAt: 1 });
      }
      socket.emit("messageHistory", messages);
    } catch (error) {
      console.error("Error fetching message history:", error);
      socket.emit("error", { message: "Error fetching message history" });
    }
  });

  // Also, update the Message model schema if you haven't already:

  socket.on("deleteMessage", async (messageId) => {
    try {
      // Find the message and mark it as deleted
      const message = await Message.findByIdAndUpdate(
        messageId,
        { isDeleted: true },
        { new: true }
      );

      if (message) {
        // Emit the updated message to both users
        io.to(message.roomId).emit("messageDeleted", { id: messageId });
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      socket.emit("error", { message: "Error deleting message" });
    }
  });

  // Add this to your socket.io server code
socket.on("updateMessage", async (data) => {
  const { messageId, content } = data;

  try {
    // Validate input
    if (!messageId || !content) {
      socket.emit("error", { message: "Invalid message data" });
      return;
    }

    // Find the message first to check permissions
    const message = await Message.findById(messageId);

    if (!message) {
      socket.emit("error", { message: "Message not found" });
      return;
    }

    // Check if the user is the sender of the message
    if (message.sender.toString() !== socket.userId) {
      socket.emit("error", { message: "Unauthorized to edit this message" });
      return;
    }

    // Update the message
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      {
        content,
        isEdited: true,
        editedAt: new Date(),
      },
      { new: true }
    ).populate("sender", "name profilePicture");

    // Emit to all users in the room
    io.to(message.roomId).emit("messageUpdated", {
      messageId: updatedMessage._id,
      content: updatedMessage.content,
      editedAt: updatedMessage.editedAt,
      isEdited: true,
    });
  } catch (error) {
    console.error("Error updating message:", error);
    socket.emit("error", {
      message: "Error updating message",
      details: error.message,
    });
  }
});

  socket.on("sendMessage", async (data) => {
    const { roomId, content, file } = data; // Include the file parameter
  
    

    if (!content.trim() && !file) return; // Ensure at least one of content or file is present

    // Helper function for determining file type
    function determineFileType(file) {
      const extension = path.extname(file).toLowerCase().replace(".", "");
      if (["png", "jpg", "jpeg", "gif"].includes(extension)) return "image";
      if (["mp4", "mov", "avi"].includes(extension)) return "video";
      if (["mp3", "wav", "ogg"].includes(extension)) return "audio";
      if (["pdf"].includes(extension)) return "pdf";
      return "other";
    }

    try {
      const fileType = file ? determineFileType(file) : null;
    

      const newMessage = new Message({
        roomId,
        content: content.trim(),
        sender: socket.userId,
        receiver: roomId.includes("-")
          ? roomId.split("-").find((id) => id !== socket.userId)
          : null,
        file: file || null,
        fileType, // Save fileType directly
      });

      await newMessage.save();
 

      if (!roomId.includes("-")) {
        await Group.findByIdAndUpdate(roomId, {
          $push: { messages: newMessage._id },
          $set: { updatedAt: new Date() },
        });
      }

      const populatedMessage = await Message.findById(newMessage._id).populate(
        "sender",
        "name profilePicture"
      );

      io.to(roomId).emit("receiveMessage", populatedMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Error sending message" });
    }
  });

  socket.on("disconnect", () => {
     
    connectedUsers.delete(socket.userId);
    io.emit("updated_users", Array.from(connectedUsers.values()));
  });
});

 

// Start the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
