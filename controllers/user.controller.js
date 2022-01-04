const User = require("../models/user.model");
const Post = require("../models/post.model");
const moment = require("moment");
const { getAvatar, getBackground } = require("../utils/file/user");
const { getAmountNofication } = require("../utils/helper");

exports.userProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const username = req.params.username;
    let isUser = user.username === username;
    let isFollowing = undefined;
    let profile = user;
    if (!username) {
      res.redirect("/not-found");
    }
    if (!isUser) {
      profile = await User.findOne(
        { username: username },
        "username avatar firstName lastName background following follower"
      );
      isFollowing = user.following.find(
        (f) => f._id.toString() === profile._id.toString()
      );
    }

    let posts = await Post.find(
      { postedBy: profile._id },
      "_id content isUpload createdAt likes"
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

    res.status(200).render("user", {
      title: "User Page",
      posts,
      user,
      profile,
      isUser,
      getAvatar,
      getBackground,
      isFollowing: isFollowing !== undefined,
      noficationAmount: getAmountNofication(user.noficationAmount),
    });
  } catch (error) {
    console.log(error);
  }
};
