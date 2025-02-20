const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: [
    {
      sender: { type: String, enum: ["user", "ai"], required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const chatModel = mongoose.model("Chat", chatSchema);

module.exports = chatModel;
