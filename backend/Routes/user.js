const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../middlewares/nodemailer");
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
require("dotenv").config();

const router = express.Router();

//////////////////////////////////// SIGN UP /////////////////////////////////////////////////////

router.post("/signup", async (req, res, next) => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.status(401).json({
        message: "User Already Exists",
      });
    }

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    const result = await user.save();
    if (!result) {
      return res.status(500).json({
        message: "Error Creating User",
      });
    }

    const message = `Here are your credentials:\nEmail: ${req.body.email}\nPassword: ${req.body.password}`;
    await sendEmail({
      email: user.email,
      subject: "Thank you for signing up!",
      message,
    });

    res.status(201).json({
      message: "User created!",
      result: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error,
    });
  }
});

///////////////////////////////////////LOGIN /////////////////////////////////////////////////////

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const fetchedUser = await User.findOne({ email });
    if (!fetchedUser) {
      return res.status(401).json({
        message: "Auth failed: No such user",
      });
    }

    const result = await bcrypt.compare(password, fetchedUser.password);
    if (result === false) {
      return res.status(401).json({
        message: "Auth failed: Incorrect password",
      });
    }

    const token = jwt.sign(
      { email: fetchedUser.email, userId: fetchedUser._id },
      process.env.JWT_SECRET,
      { expiresIn: 86400 }
    );

    res.status(200).json({
      token: token,
      expiresIn: 86400,
      userId: fetchedUser._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "An error occurred during login",
      error: error,
    });
  }
});

////////////////////////////////////////////////// FORGOT PASSOWRD/////////////////////////////////////////////////

const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const hashToken = (token) => {
  const sha256 = crypto.createHash("sha256");
  sha256.update(token);
  return sha256.digest("hex");
};

router.post("/forgotPassword", async (req, res, next) => {
  try {
    const email = req.body.email;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const resetToken = generateToken();
    const tokenDB = hashToken(resetToken);

    user.passwordResetToken = tokenDB;
    await user.save({ validateBeforeSave: false });

    const resetURL = `http://localhost:4200/#/reset-password/${resetToken}`;

    const message = `Hey ${user.email} \n Forgot your password? Don't Worry :) \n Submit a PATCH request with your new password to: ${resetURL} \n If you didn't forget your password, please ignore this email ! `;

    await sendEmail({
      email: user.email,
      subject: "Your password reset token is only valid for 10 mins!",
      message,
    });

    res.status(200).json({
      message: "Forgot Password Token sent to email!",
      token: resetToken,
    });

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    await delay(600000); 
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });
    console.log("Password reset token deleted successfully");
  } catch (err) {
    console.log(err);
  }
});

///////////////////////////////////////////////RESET PASSWORD //////////////////////////////////////////////////

router.patch("/resetPassword/:token", async (req, res, next) => {
  try {
    const { password } = req.body;
    const token = req.params.token;
    const hashedToken = hashToken(token);

    const user = await User.findOne({ passwordResetToken: hashedToken });

    if (!user) {
      return res.status(404).json({
        message: "Invalid or expired token",
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    await user.save();

    const message = `Your password has been successfully reset.\n\nEmail: ${user.email}\nPassword: ${password}`;
    await sendEmail({
      email: user.email,
      subject: "Password Reset Successfull!",
      message,
    });

    res.status(200).json({
      msg: "Password successfully changed",
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
