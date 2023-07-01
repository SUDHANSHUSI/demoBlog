const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  passwordResetToken: { type: String },
  resetTokenExpiration: {
    type: Date,
  },
});

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

userSchema.virtual("userProfile", {
  ref: "Profile",
  localField: "_id",
  foreignField: "creator",
});

const User = new mongoose.model("User", userSchema);

module.exports = User;
