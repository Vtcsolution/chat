const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  psychicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AiPsychic",
    required: true,
  },
  messages: [
    {
      sender: {
        type: String, // 'user' or 'ai'
        enum: ["user", "ai"],
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
