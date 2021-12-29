const Post = require("../../models/post.model");
const User = require("../../models/user.model");
const Nofication = require("../../models/nofication.model");

exports.createNewPost = async (req, res, next) => {
  const user = req.user;
  const { content, edit } = req.body;
  const io = req.app.get("socketIo");
  try {
    const post = await Post.create({
      content: content,
      postedBy: req.user._id,
    });

    await post.populate("postedBy");
    if (edit) {
      io.emit("edit", post);
    } else {
      io.emit("post", post);
    }

    const nofication = await Nofication.create({
      createdBy: user._id,
      recivers: user.follower,
      content: "CREATE_NEW_POST",
      postId: post._id
    });

    for (let f of user.follower) {
      const userFollower = await User.findById(f);
      userFollower.nofications.push(nofication._id);
      userFollower.noficationAmount += 1;
      await userFollower.save();
    }

    io.emit("nofication-new-post", { followers: user.follower } )
    res.status(200);
  } catch (error) {
    res.status(400);
  }
};

exports.deletePost = async (req, res, next) => {
  const { postId } = req.body;
  const { _id, username } = req.user;
  const io = req.app.get("socketIo");
  try {
    if (!postId) {
      throw new Error("Id not provided");
    }
    const post = await Post.findById(postId, "_id postedBy");
    if (!post) {
      throw new Error("Post not found");
    }
    if (post.postedBy.toString() !== _id.toString()) {
      throw new Error("User not allowed");
    }
    await Post.findByIdAndRemove(post._id);
    io.emit("deleted-post", { postId: post._id, username });
    await Nofication.deleteMany({ postId: post._id })
    res.status(200).send({ deleted: true });
  } catch (error) {
    console.log(error.message);
  }
};
