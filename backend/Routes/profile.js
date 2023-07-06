const express = require("express");
const multer = require("multer");
const checkAuth = require("../middlewares/check-auth");
const router = express.Router();
const profileController = require("../controllers/profileController");

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

/////////////////////////////////////////////// CREATE PROFILE./////////////////////////////////////////////////////

router.post(
  "/create",
  checkAuth,
  multer({ storage: storage }).single("image"),
  profileController.createProfile
);

////////////////////////////////////////EDIT PROFILE //////////////////////////////////////////////////

router.put(
  "/edit/:id",
  checkAuth,
  multer({ storage: storage }).single("image"),
  profileController.updateProfile
);
////////////////////////////////////////GET ALL PROFILES////////////////////////////////////////////////////////

router.get("/profiles", profileController.allProfiles);

////////////////////////////////////////VIEW PROFILE////////////////////////////////////////////////////////////

router.get("/viewprofile", checkAuth, profileController.viewprofile);

//////////////////////////////////////////////////GET PROFILE BY CREATORID////////////////////////////////////////////////

router.get("/bycreator/:id", profileController.profileById);
///////////////////////////////GET POST BY PROFILE ID/////////////////////////////////

router.get("/:id/mypost", profileController.getPostByProfileId);

//////////////////////////////////////GET PROFILE BY ID////////////////////////////////////////////////////////////

router.get("/:id", profileController.getProfileById);

module.exports = router;
