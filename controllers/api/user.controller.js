const Post = require("../../models/post.model");
const User = require("../../models/user.model");

exports.follow = async (req, res, next) => {
  const { username } = req.body;
  const { _id } = req.user;
  try {
    const userFollowing = await User.findOne({ username: username});
    const user = await User.findById(_id);
    const following = user.following.find(f => f._id.toString() === userFollowing._id.toString());
    if(!following){
      user.following.push(userFollowing._id);
      userFollowing.follower.push(user._id);
      await user.save();
      await userFollowing.save();
    }
    else{
      user.following = user.following.filter(f => f._id.toString() !== following.toString())
      userFollowing.follower = user.follower.filter(f => f._id.toString() !== user._id.toString());
      await user.save();
      await userFollowing.save();
    }
  } catch (error) {
    console.log(error);
  }
};
