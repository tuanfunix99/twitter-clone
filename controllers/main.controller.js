const Post = require("../models/post.model");
const User = require("../models/user.model");
const moment = require("moment");

exports.main = async (req, res) => {
  const title = "Home";
  const { avatar, username } = req.user;
  const user_main = await User.findById(req.user._id);
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
    .filter((post) => user_main.following.includes(post.postedBy._id))
    .map((post) => {
      post.time = moment(new Date(post.createdAt)).fromNow();
      return post;
    })
    .sort(
      (p1, p2) =>
        new Date(p2.createdAt).getTime() - new Date(p1.createdAt).getTime()
    );
  res.status(200).render("home", { title, avatar, posts, users, username });
};
