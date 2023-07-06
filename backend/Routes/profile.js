const express = require("express");
const multer = require("multer");
const checkAuth = require("../middlewares/check-auth");
const Profile = require("../models/profile");
const Post = require("../models/post");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/gif": "gif",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];

    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "images");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  },
});

const router = express.Router();


/////////////////////////////////////////////// CREATE PROFILE./////////////////////////////////////////////////////

router.post(
  "/create",
  checkAuth,
  multer({ storage: storage }).single("image"),
  async (req, res, next) => {
    try {
      const url = req.protocol + "://" + req.get("host");
      const profile = new Profile({
        username: req.body.username,
        bio: req.body.bio,
        imagePath: url + "/images/" + req.file.filename,
        creator: req.userData.userId,
      });

      const existingProfile = await Profile.findById(req.userData.userId);
      if (existingProfile) {
        return res.status(401).json({
          message: "Profile Already Exists",
        });
      }

      const savedProfile = await profile.save();
      if (!savedProfile) {
        return res.status(500).json({
          message: "Error Creating Profile",
        });
      }

      res.status(201).json({
        message: "Profile created!",
        profile: savedProfile,
      });
    } catch (error) {
      console.log("Error:", error);
      res.status(500).json({
        message: "Error Creating Profile",
        error: error.message,
      });
    }
  }
);

////////////////////////////////////////EDIT PROFILE //////////////////////////////////////////////////

router.put(
  "/edit/:id",
  checkAuth,
  multer({ storage: storage }).single("image"),
  async (req, res, next) => {
    try {
      let imagePath = req.body.imagePath;
      const url = req.protocol + "://" + req.get("host");
      if (req.file) {
        imagePath = url + "/images/" + req.file.filename;
      }

      const profile = {
        username: req.body.username,
        bio: req.body.bio,
        imagePath: imagePath,
        creator: req.userData.userId,
      };

      const updatedProfile = await Profile.findByIdAndUpdate(
        req.params.id,
        profile,
        { new: true }
      );

      if (updatedProfile) {
        res.status(200).json({ message: "Update successful!" });
      } else {
        res.status(404).json({ message: "Profile not found or unauthorized" });
      }
    } catch (error) {
      console.log("Error:", error);
      res
        .status(500)
        .json({ message: "Error updating profile", error: error.message });
    }
  }
);
////////////////////////////////////////GET ALL PROFILES////////////////////////////////////////////////////////

router.get("/profiles", async (req, res, next) => {
  try {
    const prof = await Profile.find();

    const sortedProfiles = prof?.sort(
      (a, b) => b.followersCount - a.followersCount
    );

    if (sortedProfiles.length > 0) {
      res.status(200).json({
        message: "Profiles fetched successfully!",
        profile: sortedProfiles,
      });
    } else {
      res.status(404).json({ message: "Profiles not found!" });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error fetching profiles", error: error.message });
  }
});

////////////////////////////////////////VIEW PROFILE////////////////////////////////////////////////////////////

router.get("/viewprofile", checkAuth, async (req, res, next) => {
  try {
    const prof = await Profile.findOne({
      creator: req.userData.userId,
    });
    await prof.save();

    if (prof) {
      res.status(200).json({
        message: "Profile fetched successfully!",
        profile: prof,
      });
    } else {
      res.status(404).json({ message: "Profile not found!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

//////////////////////////////////////////////////GET PROFILE BY CREATORID////////////////////////////////////////////////

router.get("/bycreator/:id", async (req, res, next) => {
  try {
    const prof = await Profile.findOne({ creator: req.params.id });
    if (prof) {
      res.status(200).json({
        message: "Profile fetched successfully!",
        profile: prof,
      });
    } else {
      res.status(404).json({ message: "Profile not found!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching profile" });
  }
});
///////////////////////////////GET POST BY PROFILE ID/////////////////////////////////

router.get("/:id/mypost", async (req, res, next) => {
  try {
    let user;
    let creatorId;
    const prof = await Profile.findOne({ username: req.params.id });
    if (prof) {
      user = prof;
      const post = await Post.find({ creator: user.creator });
      res.status(200).json({
        message: "Post fetched successfully!",
        post: post,
      });
    } else {
      res.status(404).json({ message: "Profile not found!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching post" });
  }
});


//////////////////////////////////////GET PROFILE BY ID////////////////////////////////////////////////////////////

router.get("/:id", async (req, res) => {
  try {
    const prof = await Profile.findOne({ username: req.params.id })
    if (prof) {
      res.status(200).json({
        message: "Profile fetched successfully!",
        profile: prof,
      });
    } else {
      res.status(404).json({ message: "Profile not found!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching profile" });
  }
});


module.exports = router;
