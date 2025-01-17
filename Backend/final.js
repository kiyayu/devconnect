require("dotenv").config(); // Load environment variables
const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const upload = require("./middleware/profileUpload")
const app = express();
app.use(bodyParser.json());

 

// Step 2: Configure MongoDB
mongoose
  .connect(process.env.MONGO_URI) 
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection failed:", err));

// Step 3: Define Mongoose Schema and Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  profilePictureUrl: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

// Step 4: Configure Multer
 

// Step 5: Registration Endpoint
app.post(
  "/api/user/register",
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      console.log("Request Body:", req.body);
      console.log("Uploaded File:", req.file);

      const { name, password } = req.body;
      const file = req.file;

      if (!name || !password || !file) {
        return res.status(400).json({
          message: "Name, password, and profile picture are required!",
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ name });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists!" });
      }
  const profilePicture = req.file ? req.file.path : null; 
      // Step 6: Upload file to Cloudinary
       
      // Step 7: Hash Password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Step 8: Save User to MongoDB
      const newUser = new User({
        name,
        password: hashedPassword,
        profilePicture,
      });
      await newUser.save();

      // Return success response
      res.status(201).json({
        message: "User registered successfully!",
        user: {
          id: newUser._id,
          name: newUser.name,
          profilePictureUrl: newUser.profilePicture,
        },
      });
    } catch (error) {
      console.error("Error during registration:", error);
      res
        .status(500)
        .json({ message: "Something went wrong!", error: error.message });
    }
  }
);

// Start the Server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
