const Post = require("../models/post.model");
const User = require("../models/user.model");
const moment = require("moment");

exports.main = async (req, res) => {
  const title = "Home";
  const { avatar } = req.user;
  let users = await User.find();
  users = users.filter(user => user._id.toString() !== req.user._id.toString())
  let posts = await Post.find().populate("postedBy");
  posts = posts.map((post) => {
    post.time = moment(new Date(post.createdAt)).fromNow();
    post.postedBy = {
      firstName: post.postedBy.firstName,
      lastName: post.postedBy.lastName,
      username: post.postedBy.username,
      avatar: post.postedBy.avatar,
    }
    return post;
  })
  .sort((p1, p2) => new Date(p2.createdAt).getTime() - new Date(p1.createdAt).getTime());
  res.status(200).render("home", { title, avatar, posts, users });
};
