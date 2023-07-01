const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const db = require("./db/db");
const header_middleware = require("./middlewares/header");

const postRouter = require("./Routes/post");
const userRoutes = require("./Routes/user");
const profileRoutes = require("./Routes/profile");
// const folUnfolRoutes = require("./Routes/folUnfol");

var cors = require("cors");

const app = express();
app.use(cors({ origin: "*" }));
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(header_middleware);
const directory = path.join(__dirname, "./images");
app.use("/images", express.static(directory));
// app.use("/", express.static(path.join(__dirname, 'frontend/dist/myblog')));

app.use("/api/posts", postRouter);
app.use("/api/user", userRoutes);
app.use("/api/profile", profileRoutes);
// app.use("/api/friends",folUnfolRoutes);

// Get posts by page
app.get("/api/posts", (req, res) => {
  const start = parseInt(req.query._start);
  const end = parseInt(req.query._end);
  const slicedPosts = posts.slice(start, end);
  res.json(slicedPosts);
});

// Get total number of posts
app.get("/api/posts/count", (req, res) => {
  res.json(posts.length);
});

// app.get('*',(req,res)=>{
//     res.sendFile(path.join(__dirname,"frontend","dist","myblog","index.html"))
// });
app.listen(PORT, (req, res) => {
  console.log(`Server is listening to PORT ${PORT}....`);
});

//  const page = req.query.page || 1;
//   const limit = req.query.limit || 8;

//   const totaltheater = await Theater.countDocuments();

//   const totalPages = Math.ceil(totaltheater / limit);
//   admins = await Theater.find()
//     .skip((page - 1) * limit)
//     .limit(limit);
