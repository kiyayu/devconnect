const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: true },  
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number, min: 13 }, // Minimum age validation from the first schema
    profilePicture: { type: String, default: null },
    profileThumbnail: { type: String, default: null }, // Optional: For an optimized profile image
    isOnline: { type: Boolean, default: false },
    phone: { type: String }, // String format to accommodate different phone formats
    address: { type: String },
    status: {
      type: String,
      enum: ["online", "offline", "away"],
      default: "offline",
    },
    lastSeen: { type: Date }, // Updated on disconnect or inactivity
    lastActive: { type: Date }, // Tracks last activity timestamp
    createdAt: { type: Date, default: Date.now }, // Already handled by timestamps
    updatedAt: { type: Date, default: Date.now },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isTyping: { type: Boolean, default: false }, // Optional for chat functionality
  },
  {
    timestamps: true, // Automatically manage `createdAt` and `updatedAt`
  }
);

// Password hashing before saving a new user or when updating the password
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
