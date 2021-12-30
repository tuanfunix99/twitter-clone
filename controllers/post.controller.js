const User = require("../models/user.model");
const Post = require("../models/post.model");
const moment = require("moment");
const { getAvatar, getBackground } = require("../utils/file/user");
const { getAmountNofication } = require("../utils/helper")

exports.postPage = async (req, res, next) => {
  const user = req.user;
  const { username, postId } = req.params;
  const isUser = username === user.username;
  try {
    if (!username || !postId) {
      return res.redirect("/not-found");
    }
    const profile = await User.findOne(
      { username: username },
      "username avatar firstName lastName background following follower"
    );
    const post = await Post.findById(postId).populate("postedBy");
    if (!profile || !post) {
      return res.redirect("/not-found");
    }
    if (profile._id.toString() !== post.postedBy._id.toString()) {
      return res.redirect("/not-found");
    }
    post.time = moment(new Date(post.createdAt)).fromNow();
    res.render("post", {
      title: "Post",
      post,
      user,
      profile,
      getAvatar,
      isUser,
      noficationAmount: getAmountNofication(user.noficationAmount),
    });
  } catch (error) {}
};
