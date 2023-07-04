const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  content: {
    type: String,
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
  },

  postDate: {
    type: String,
    required: true,
  },

  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      comment: {
        type: String,
        required: true,
        trim: true,
      },
    },
  ],
  likeCount: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: true,
  },
});

const Post = new mongoose.model("Post", postSchema);

module.exports = Post;
