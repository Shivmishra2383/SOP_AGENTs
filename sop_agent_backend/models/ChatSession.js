const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true
    },
    text: {
      type: String,
      required: true
    },
    sources: [
      {
        sopId: String,
        title: String,
        fileName: String,
        pageNumber: Number,
        chunkIndex: Number,
        score: Number,
        excerpt: String,
        citation: String
      }
    ]
  },
  { timestamps: true, _id: false }
);

const chatSessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "New conversation"
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    sopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SOP",
      default: null
    },
    messages: [chatMessageSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatSession", chatSessionSchema);
