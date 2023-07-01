const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },

  bio: {
    type: String,
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  followersCount: {
    type: Number,
  },
  followingCount: {
    type: Number,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Profile = new mongoose.model("Profile", profileSchema);

module.exports = Profile;
