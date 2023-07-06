const Post = require("../models/post");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");

const createPost = asyncHandler(async (req, res) => {
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
});

const getMyPost = asyncHandler(async (req, res) => {
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

const getAllPosts = asyncHandler(async (req, res) => {
  try {
    const documents = await Post.find();

    const sortedOnLikes = documents?.sort((a, b) => a.likeCount - b.likeCount);

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

const getPostById = asyncHandler(async (req, res) => {
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

const updatePostById = asyncHandler(async (req, res) => {
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
});

const deletePost = asyncHandler(async (req, res) => {
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

const likePost = asyncHandler(async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userData.userId;

    const post = await Post.findById(postId);
    const user = await User.findById(userId);

    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }

    const userLiked = post.likes.includes(userId);

    if (userLiked) {
      post.likes.pull(userId);
      post.likeCount -= 1;
    } else {
      post.likes.push(userId);
      post.likeCount += 1;
    }

    await post.save();

    res
      .status(200)
      .json({ message: "Toggle like successful!", post: { ...post, user } });
  } catch (error) {
    res.status(500).json({ message: "Error toggling like" });
  }
});

const unlikePost = asyncHandler(async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userData.userId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }

    const userLiked = post.likes.includes(userId);

    if (userLiked) {
      post.likes.pull(userId);
      post.likeCount -= 1;

      await post.save();

      res.status(200).json({ message: "Post unliked successfully!" });
    } else {
      res.status(400).json({ message: "You have not liked this post!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error unliking post" });
  }
});

const addComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  const user = await User.findById(req.userData.userId);

  if (!post) {
    return "Post Not Found", 404;
  }

  if (post.comments.includes(req.userData.userId)) {
    return "Already Commented", 500;
  }

  const newComment = {
    user: req.userData.userId,
    name: user.name,
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

const getPostByCategory = asyncHandler(async (req, res) => {
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

const getAllCategories = asyncHandler(async (req, res) => {
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

const searchPost = asyncHandler(async (req, res) => {
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

const likeList = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId).populate({
    path: "likes",
    select: "_id email",
    // populate: {
    //   path: "_id",
    //   model: User,
    //   ref: "User",
    //   populate: {
    //     path: "userProfile",
    //     select:
    //       "username bio imagePath followers following followersCount followingCount",
    //   },
    // },
  });

  if (!post) {
    return res.json({
      status: "fail",
      msg: "Post not found",
    });
  }

  return res.status(200).json({
    post,
  });
});

module.exports = {
  createPost,
  getMyPost,
  getAllPosts,
  getPostById,
  updatePostById,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  getPostByCategory,
  getAllCategories,
  searchPost,
  likeList,
};
