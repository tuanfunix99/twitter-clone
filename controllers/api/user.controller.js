const Post = require("../../models/post.model");
const User = require("../../models/user.model");

exports.follow = async (req, res, next) => {
  const { username } = req.body;
  const { _id } = req.user;
  let posts = await Post.find({} ,"content createdAt").populate(
    "postedBy",
    "username firstName lastName avatar"
  );
  const io = req.app.get("socketIo");

  try {
    const userFollowing = await User.findOne({ username: username });
    const user = await User.findById(_id);
    const following = user.following.find(
      (f) => f._id.toString() === userFollowing._id.toString()
    );

    if (!following) {
      posts = posts.filter(
        (post) => post.postedBy._id.toString() === userFollowing._id.toString()
      );
      io.emit("follow", posts);
      user.following.push(userFollowing._id);
      userFollowing.follower.push(user._id);
      await user.save();
      await userFollowing.save();
    } else {
      posts = posts
        .filter((post) => post.postedBy._id.toString() === following.toString())
        .map((post) => post._id.toString());
      io.emit("unfollow", posts);
      user.following = user.following.filter(
        (f) => f._id.toString() !== following.toString()
      );
      userFollowing.follower = user.follower.filter(
        (f) => f._id.toString() !== user._id.toString()
      );
      await user.save();
      await userFollowing.save();
    }
  } catch (error) {
    console.log(error);
  }
};
