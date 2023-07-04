const express = require("express");
const Post = require("../models/post");
const router = express.Router();
const multer = require("multer");
const checkAuth = require("../middlewares/check-auth");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/gif": "gif",
};

//////////////////////////////////////////////////// MULTER ///////////////////////////////////////////////////////////////

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

//////////////////////////////////////////////// CREATE POST ////////////////////////////////////////////////////////////////

router.post(
  "",
  checkAuth,
  multer({ storage: storage }).single("image"),
  async (req, res) => {
    try {
      const url = req.protocol + "://" + req.get("host");
      const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + "/images/" + req.file.filename,
        creator: req.userData.userId,
        postDate: req.body.postDate,
        category: req.body.category,
      });

      const savedPost = await post.save();

      if (savedPost) {
        res.status(201).json({
          message: "Post added successfully",
          post: {
            ...savedPost._doc,
            id: savedPost._id,
          },
        });
      } else {
        res.status(500).json({ message: "Error adding post" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error adding post" });
    }
  }
);

/////////////////////////////////////////////////// GET MY POST ////////////////////////////////////////////////////////////

router.get("/mypost", checkAuth, async (req, res) => {
  try {
    const posts = await Post.find({ creator: req.userData.userId });

    if (posts) {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: posts,
      });
    } else {
      res.status(404).json({ message: "Posts not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

////////////////////////////////////////////////// GET ALL POSTS ///////////////////////////////////////////////////////////

router.get("", async (req, res) => {
  try {
    const documents = await Post.find();

    const sortedOnLikes = documents?.sort((a, b) => a.likeCount - b.likeCount);
    console.log(sortedOnLikes);

    if (sortedOnLikes) {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: sortedOnLikes,
      });
    } else {
      res.status(404).json({ message: "Posts not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

////////////////////////////////////////////////// GET POST BY ID //////////////////////////////////////////////////////////

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching post" });
  }
});

///////////////////////////////////////////////////// UPDATE POST BY ID//////////////////////////////////////////////////////

router.put(
  "/:id",
  checkAuth,
  multer({ storage: storage }).single("image"),
  async (req, res) => {
    try {
      let imagePath = req.body.imagePath;
      if (req.file) {
        const url = req.protocol + "://" + req.get("host");
        imagePath = url + "/images/" + req.file.filename;
      }

      const postId = req.params.id;
      const post = {
        title: req.body.title,
        content: req.body.content,
        imagePath: imagePath,
        creator: req.userData.userId,
        category: req.body.category,
      };

      const updatedPost = await Post.findByIdAndUpdate(
        { _id: postId, creator: req.userData.userId },
        post,
        { new: true }
      );

      if (updatedPost) {
        res
          .status(200)
          .json({ message: "Update successful!", post: updatedPost });
      } else {
        res.status(404).json({
          message: "Post not found or you are not authorized to update it",
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Error updating post" });
    }
  }
);

///////////////////////////////////////////////////// DELETE POST BY ID ////////////////////////////////////////////////

router.delete("/:id", checkAuth, async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete({
      _id: req.params.id,
      creator: req.userData.userId,
    });
    if (deletedPost) {
      res.status(200).json({ message: "Post deleted successfully" });
    } else {
      res.status(404).json({
        message: "Post not found or you are not authorized to delete it",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while deleting the post" });
  }
});

// Like or Unlike Post

router.get("/:postId/likes", checkAuth, async (req, res) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    return "Post Not Found", 404;
  }

  if (post.likes.includes(req.userData.userId)) {
    const index = post.likes.indexOf(req.userData.userId);

    post.likes.splice(index, 1);
    post.likeCount -= 1;
    await post.save();

    return res.status(200).json({
      success: true,
      message: "Post Unliked",
      likeCount: post.likes.length,
    });
  } else {
    post.likes.push(req.userData.userId);
    post.likeCount += 1; // Increment like count

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Post Liked",
      likeCount: post.likes.length,
    });
  }
});

// Add Comment
router.post("/:postId/comment", checkAuth, async (req, res) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    return "Post Not Found", 404;
  }

  if (post.comments.includes(req.userData.userId)) {
    return "Already Commented", 500;
  }

  const newComment = {
    user: req.userData.userId,
    comment: req.body.comment,
  };
  post.comments.unshift(newComment);

  await post.save();

  return res.status(200).json({
    success: true,
    message: "Comment Added",
    comment: newComment,
  });
});

///////////////////////////////////////////////// GET POSTS BY CATEGORY ////////////////////////////////////////////////////

router.get("/category/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const posts = await Post.find({
      category: { $regex: new RegExp(category, "i") },
    });

    if (posts) {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: posts,
      });
    } else {
      res.status(404).json({ message: "Posts not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

////////////////////////////////////////////////// GET ALL CATEGORIES //////////////////////////////////////////////////////

router.get("/All/categories", async (req, res) => {
  try {
    const categories = await Post.distinct("category");

    if (categories.length > 0) {
      res.status(200).json({
        message: "Categories fetched successfully!",
        categories: categories,
      });
    } else {
      res.status(404).json({ message: "Categories not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories" });
  }
});

///////////////////////////////////////////////////// SEARCH POSTS /////////////////////////////////////////////////////////

router.get("/search/post", async (req, res) => {
  try {
    const searchTerm = req.query.q;
    const regex = new RegExp(searchTerm, "i");

    const posts = await Post.find({
      $or: [
        { title: { $regex: regex } },
        { category: { $regex: regex } },
        { content: { $regex: regex } },
      ],
    });

    if (posts.length > 0) {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: posts,
      });
    } else {
      res.status(404).json({ message: "Posts not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error searching post" });
  }
});

module.exports = router;
