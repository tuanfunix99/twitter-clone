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
    const userLoad = await User.findOne(
      { username: username },
      "_id avatar firstName lastName background following follower"
    );
    const post = await Post.findById(postId).populate("postedBy");
    if (!userLoad || !post) {
      return res.redirect("/not-found");
    }
    if (userLoad._id.toString() !== post.postedBy._id.toString()) {
      return res.redirect("/not-found");
    }
    post.time = moment(new Date(post.createdAt)).fromNow();
    res.render("post", {
      title: "Post",
      username: req.user.username,
      post,
      user: userLoad,
      getAvatar,
      _id: user._id,
      noficationAmount: getAmountNofication(user.noficationAmount),
      isUser
    });
  } catch (error) {}
};
