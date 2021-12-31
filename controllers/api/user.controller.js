const Post = require("../../models/post.model");
const User = require("../../models/user.model");
const Nofication = require("../../models/nofication.model");
const fs = require("fs");
const path = require("path");
const { uploadFile, getFileStream, deleteFile } = require("../../utils/aws/s3");

exports.follow = async (req, res, next) => {
  const { username, main } = req.body;
  const { _id } = req.user;
  try {
    const userFollowing = await User.findOne({ username: username });
    const user = await User.findById(_id);
    const following = user.following.find(
      (f) => f._id.toString() === userFollowing._id.toString()
    );
    if (!following) {
      if (main) {
        const posts = await Post.find(
          { postedBy: userFollowing._id },
          "content createdAt"
        )
          .populate("postedBy", "username firstName lastName avatar")
          .limit(5);
        res.status(200).send({ posts, follow: true });
      } else {
        res.status(200).send({ follow: true });
      }
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


const upload = async (title, req, res, next) => {
  const { _id } = req.user;
  const { filename } = req.file;
  const io = req.app.get("socketIo");
  try {
    if (!filename) {
      throw new Error("error");
    }
    const user = await User.findById(_id);
    if (
      user[title].trim().length > 0 &&
      user[title].trim() !== "/images/profilePic.jpeg"
    ) {
      const key = user[title].split("/")[1];
      await deleteFile(key);
      const postDel = await Post.findOneAndRemove({
        content: `<img src='/api/user/user-images/${user[title]}'>`,
      });
      if (postDel) {
        io.emit("deleted-post", {
          postId: postDel._id,
          username: user.username,
        });
      }
      fs.unlink(
        path.join(__dirname, "../../uploads", user[title]),
        function () {
          console.log("Image deleted");
        }
      );
    }
    await uploadFile(req.file);
    user[title] = `${title}/` + filename;
    io.emit(`upload-${title}`, {
      _id: user._id,
      linkImage: user[title],
    });
    await user.save();
    const post = await Post.create({
      content: `<img src='/api/user/user-images/${user[title]}'>`,
      postedBy: req.user._id,
      isUpload: true,
    });
    await post.populate("postedBy");
    io.emit("upload-new-image", post);
    for (let f of user.follower) {
      const userFollower = await User.findById(f);
      const nofication = await Nofication.create({
        createdBy: user._id,
        reciver: userFollower._id,
        content: title === 'avatar' ? "UPLOAD_NEW_AVATAR" : "UPLOAD_NEW_BACKGROUND",
        postId: post._id,
      });
      userFollower.nofications.push(nofication._id);
      userFollower.noficationAmount += 1;
      await userFollower.save();
      const nof =
      await nofication.populate(
        "createdBy",
        "username firstName lastName avatar"
        );
      io.emit("nofication-new-post", { follower: f });
      io.emit("created-nofication", { nof });
    }
  } catch (error) {
    res.redirect("/");
  }
}

exports.uploadAvatar = async (req, res, next) => {
  const { uploadTitle } = req.body;
  if(uploadTitle && uploadTitle.trim() === "avatar"){
    upload(uploadTitle.trim(), req, res, next);
  }
  else{
    res.status(400);
  }
};

exports.uploadBackground = async (req, res, next) => {
  const { uploadTitle } = req.body;
  if(uploadTitle && uploadTitle.trim() === "background"){
    upload(uploadTitle.trim(), req, res, next);
  }
  else{
    res.status(400);
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
  try {
    let users = await User.find({}, "_id avatar username firstName lastName");
    res.status(200).send(users);
  } catch (error) {
    console.log(error);
  }
};
