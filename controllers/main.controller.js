const Post = require("../models/post.model");
const User = require("../models/user.model");
const moment = require("moment");

exports.main = async (req, res) => {
  const title = "Home";
  const user_main = req.user;
  let users = await User.find({ isActive: true });
  users = users
    .filter((user) => user._id.toString() !== req.user._id.toString())
    .filter((user) => !user_main.following.includes(user._id))
    .splice(0, 5);
  let posts = await Post.find().populate(
    "postedBy",
    "username firstName lastName avatar"
  );
  posts = posts
    .filter((post) => {
      if (
        user_main.following.includes(post.postedBy._id) ||
        user_main._id.toString() === post.postedBy._id.toString()
      )
        return post;
    })
    .map((post) => {
      post.time = moment(new Date(post.createdAt)).fromNow();
      return post;
    })
    .sort(
      (p1, p2) =>
        new Date(p2.createdAt).getTime() - new Date(p1.createdAt).getTime()
    );
  res
    .status(200)
    .render("home", {
      title,
      posts,
      users,
      avatar: user_main.avatar,
      username: user_main.username,
      _id: user_main._id,
    });
};
