const memberSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
    },
    unreadMessages: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Member = mongoose.model("Member", memberSchema);
module.exports = Member;
