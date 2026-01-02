const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    author: String,

    reactions: {
      like: [{ type: String }], // store user emails
      love: [{ type: String }],
    },

    comments: [
      {
        text: String,
        user: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
