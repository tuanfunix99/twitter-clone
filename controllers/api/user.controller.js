const Post = require("../../models/post.model");
const User = require("../../models/user.model");
const fs = require("fs");
const path = require("path");
const { uploadFile, getFileStream } = require("../../utils/aws/s3");

exports.follow = async (req, res, next) => {
  const { username } = req.body;
  const { _id } = req.user;
  try {
    const userFollowing = await User.findOne({ username: username });
    const user = await User.findById(_id);
    const following = user.following.find(
      (f) => f._id.toString() === userFollowing._id.toString()
    );
    if (!following) {
      const posts = await Post.find(
        { postedBy: userFollowing._id },
        "content createdAt"
      )
        .populate("postedBy", "username firstName lastName avatar")
        .limit(5);
      res.status(200).send({ posts, follow: true });
      user.following.push(userFollowing._id);
      userFollowing.follower.push(user._id);
      await user.save();
      await userFollowing.save();
    } else {
      res.status(200).send({ follow: false });
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

exports.uploadAvatar = async (req, res, next) => {
  const { _id } = req.user;
  const { filename } = req.file;
  const io = req.app.get("socketIo");
  try {
    if (!filename) {
      throw new Error("error");
    }
    const user = await User.findById(_id);
    if (
      user.avatar.trim().length > 0 &&
      user.avatar !== "/images/profilePic.jpeg"
    ) {
      fs.unlink(
        path.join(__dirname, "../../uploads", user.avatar),
        function () {
          console.log("Image deleted");
        }
      );
    }
    await uploadFile(req.file);
    user.avatar = "avatar/" + filename;
    io.emit("upload-avatar", {
      _id,
      avatar: user.avatar,
    });
    await user.save();
  } catch (error) {
    res.redirect("/");
  }
};

exports.uploadBackground = async (req, res, next) => {
  const { _id } = req.user;
  const { filename } = req.file;
  const io = req.app.get("socketIo");
  try {
    if (!filename) {
      throw new Error("error");
    }
    const user = await User.findById(_id);
    if (
      user.background.trim().length > 0 &&
      user.background !== "/images/background_default.png"
    ) {
      fs.unlink(
        path.join(__dirname, "../../uploads", user.background),
        function () {
          console.log("Image deleted");
        }
      );
    }
    await uploadFile(req.file);
    user.background = "background/" + filename;
    io.emit("upload-background", { _id, background: user.background });
    await user.save();
  } catch (error) {
    res.redirect("/");
  }
};

exports.getUserImages = (req, res, next) => {
  const { key } = req.params;
  try {
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch (error) {
    console.log(error.message);
  }
};

exports.searchUser = async (req, res, next) => {
  const { value } = req.body;
  try {
    if (!value || value.trim().length === 0) {
      return res.status(200).send([]);
    }
    let users = await User.find(
      {
        $or: [
          { username: { $regex: ".*" + value + ".*" } },
          { firstName: { $regex: ".*" + value + ".*" } },
          { lastName: { $regex: ".*" + value + ".*" } },
        ],
      },
      "_id avatar username firstName lastName"
    );
    res.status(200).send(users);
  } catch (error) {
    console.log(error);
  }
};
