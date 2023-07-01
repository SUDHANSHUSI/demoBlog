const mongoose = require("mongoose");
require('dotenv').config();

const url =process.env.MONGODB_URL
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database is connected succesfully...");
  })
  .catch((err) => {
    console.log("Error in DB connection: " + err);
  });
