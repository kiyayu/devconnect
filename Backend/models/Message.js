const mongoose = require("mongoose");
// const Schema = mongoose.Schema
// const messageSchema = new Schema(
//   {
//     conversation: {
//       type: Schema.Types.ObjectId,
//       ref: "Conversation",
//       required: true,
//     },
//     sender: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     text: {
//       type: String,
//     },
//     messageType: {
//       type: String,
//       enum: ["text", "image", "file"],
//       default: "text",
//     },
//     attachment: {
//       type: String, // URL or file reference, depending on your file storage solution
//     },
//     reactions: [
//       {
//         emoji: String,
//         user: {
//           type: Schema.Types.ObjectId,
//           ref: "User",
//         },
//       },
//     ],
//     readBy: [
//       {
//         user: {
//           type: Schema.Types.ObjectId,
//           ref: "User",
//         },
//         readAt: {
//           type: Date,
//           default: Date.now,
//         },
//       },
//     ],
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { timestamps: true }
// );

// const Message = mongoose.model("Message", messageSchema);

 

 

const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  content: { type: String },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  file: { type: String },
  fileType: { type: String, enum: ["pdf", "image", "video", "audio", "other"] },
  createdAt: { type: Date, default: Date.now },
  editedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
});


const Message = mongoose.model("Message", messageSchema);

module.exports = Message;



