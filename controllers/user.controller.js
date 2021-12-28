const User = require("../models/user.model");
const Post = require("../models/post.model");
const moment = require("moment");
const { getAvatar, getBackground } = require("../utils/file/user");

exports.userProfile = async (req, res, next) => {
  const username = req.params.username;
  let isUser = req.user.username === username;
  if (!username) {
    res.redirect("/");
  }
  try {
    const {
      _id,
      avatar,
      firstName,
      lastName,
      background,
      following,
      follower,
    } = await User.findOne(
      { username: username },
      "_id avatar firstName lastName background following follower"
    );
    const isFollowing = req.user.following.find(
      (f) => f._id.toString() === _id.toString()
    );
    let posts = await Post.find(
      { postedBy: _id },
      "_id content createdAt"
    ).populate("postedBy", "_id avatar firstName lastName username");
    posts = posts
      .map((post) => {
        post.time = moment(new Date(post.createdAt)).fromNow();
        return post;
      })
      .sort(
        (p1, p2) =>
          new Date(p2.createdAt).getTime() - new Date(p1.createdAt).getTime()
      );
    res.render("user", {
      title: "User Profile",
      avatar,
      username,
      firstName,
      lastName,
      posts,
      background,
      isUser,
      _id,
      getAvatar,
      getBackground,
      isFollowing: isFollowing !== undefined,
      following: following.length,
      follower: follower.length,
    });
  } catch (error) {
    console.log(error.message);
  }
};
