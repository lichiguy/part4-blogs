/* eslint-disable no-undef */
const mongoose = require("mongoose");
require("dotenv").config();

const title = "TDD harms architecture";
const author = "Robert C. Martin";
const blogUrl =
  "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html";
const likes = 0;

const url = process.env.TEST_MONGO_DB_URI;
console.log('connecting to: ', url)

mongoose.set("strictQuery", false);

mongoose.connect(url);

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
});

const Blog = mongoose.model("Blog", blogSchema);

const blog = new Blog({
  title: title,
  author: author,
  url: blogUrl,
  likes: likes,
});

blog.save().then(() => {
  console.log(`added blog`);
  mongoose.connection.close();
});
