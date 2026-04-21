const mongoose = require("mongoose");

const sopSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    fileName: {
      type: String
    },

    originalFileName: {
      type: String
    },

    textContent: {
      type: String
    },

    totalPages: {
      type: Number,
      default: 0
    },

    chunkCount: {
      type: Number,
      default: 0
    },

    pages: [
      {
        pageNumber: Number,
        text: String
      }
    ],

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("SOP", sopSchema);
