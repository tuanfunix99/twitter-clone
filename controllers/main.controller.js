const Post = require("../models/post.model");
const User = require("../models/user.model");
const moment = require("moment");
const { getAvatar } = require("../utils/file/user");
const { getAmountNofication } = require("../utils/helper");

exports.main = async (req, res) => {
  try {
    const user = req.user;
    let users = await User.find({ isActive: true });
    userFollows = users
      .filter((user) => user._id.toString() !== req.user._id.toString())
      .filter((user) => !user.following.includes(req.user._id))
      .splice(0, 5);
    let posts = await Post.find().populate(
      "postedBy",
      "username firstName lastName avatar"
    );
    posts = posts
      .filter((post) => {
        if (
          user.following.includes(post.postedBy._id) ||
          user._id.toString() === post.postedBy._id.toString()
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
    res.status(200).render("home", {
      title: "Twitter",
      posts,
      userFollows,
      user,
      getAvatar,
      isUser: null,
      noficationAmount: getAmountNofication(user.noficationAmount),
    });
  } catch (error) {
    console.log(error);
  }
};
