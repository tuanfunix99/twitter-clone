const Post = require("../../models/post.model");
const User = require("../../models/user.model");
const Nofication = require("../../models/nofication.model");

exports.updatePost = async (req, res, next) => {
  const { content, postId } = req.body;
  const user = req.user;
  const io = req.app.get("socketIo");
  try {
    if (!postId) {
      throw new Error("Id not provided");
    }
    const post = await Post.findById(postId, "_id content postedBy");
    if (!post) {
      throw new Error("Post not found");
    }
    if (post.postedBy.toString() !== user._id.toString()) {
      throw new Error("User not allowed");
    }
    post.content = content;
    await post.save();
    io.emit("update", post);
    res.status(200);
  } catch (error) {
    res.status(400);
  }
};

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
    for (let f of user.follower) {
      const userFollower = await User.findById(f);
      const nofication = await Nofication.create({
        createdBy: user._id,
        reciver: userFollower._id,
        content: "CREATE_NEW_POST",
        postId: post._id
      });
      userFollower.nofications.push(nofication._id);
      userFollower.noficationAmount += 1;
      await userFollower.save();
      const nofica = await nofication.populate(
        "createdBy",
        "username firstName lastName avatar"
      );
      const nofPost = {
        _id: post._id,
        postedBy: {
          username: post.postedBy.username,
        },
      };
      const nof = {
        _id: nofica._id,
        content: nofica.content,
        createdBy: nofica.createdBy,
        reciver: nofica.reciver,
        createdAt: nofica.createdAt,
        seen: nofica.seen,
        nofPost: nofPost,
      };
      io.emit("new-nofication", { nof });
      io.emit("created-nofication", { nof });
    }

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
    const users = await User.find({}, 'likes');
    for(let user of users) {
      if(user.likes.includes(post._id)) {
        const u = await User.findById(user._id, 'likes');
        const index = u.likes.indexOf(post._id);
        if(index !== -1) {
          u.likes.splice(index, 1);
        }
        await u.save();
      }
    }
    res.status(200).send({ deleted: true });
  } catch (error) {
    console.log(error.message);
  }
};

exports.loadPost = async (req, res, next) => {
  const { postId } = req.body;
  const { _id } = req.user;
  try {
    if (!postId) {
      throw new Error("Id not provided");
    }
    const post = await Post.findById(postId, "_id content postedBy");
    if (!post) {
      throw new Error("Post not found");
    }
    if (post.postedBy.toString() !== _id.toString()) {
      throw new Error("User not allowed");
    }
    res.status(200).send({ post: post });
  } catch (error) {
    console.log(error.message);
  }
};

exports.likePost = async (req, res, next) => {
  const { postId } = req.body;
  const { _id } = req.user;
  const io = req.app.get("socketIo");
  try {
    const post = await Post.findById(postId, "likes").populate(
      "postedBy",
      "_id username"
    );
    const user = await User.findById(_id, "likes");
    if (post.likes.includes(_id) && user.likes.includes(postId)) {
      post.likes = post.likes.filter(
        (like) => like.toString() != _id.toString()
      );
      user.likes = user.likes.filter(
        (like) => like.toString() != postId.toString()
      );
      io.emit("unlike", { postId, userId: _id });
    } else {
      post.likes.push(_id);
      user.likes.push(postId);
      io.emit("like", { postId, userId: _id });
      if (post.postedBy._id.toString() !== _id.toString()) {
        const nofication = await Nofication.create({
          createdBy: _id,
          reciver: post.postedBy._id,
          content: "LIKE_POST",
          postId: post._id
        });
        const reciver = await User.findById(post.postedBy);
        reciver.nofications.push(nofication._id);
        reciver.noficationAmount += 1;
        await reciver.save();
        const nofica = await nofication.populate(
          "createdBy",
          "username firstName lastName avatar"
        );
        const nofPost = {
          _id: post._id,
          postedBy: {
            username: post.postedBy.username,
          },
        };
        const nof = {
          _id: nofica._id,
          content: nofica.content,
          createdBy: nofica.createdBy,
          reciver: nofica.reciver,
          createdAt: nofica.createdAt,
          seen: nofica.seen,
          nofPost: nofPost,
        };
        io.emit("new-nofication", { nof });
        io.emit("created-nofication", { nof });
      }
    }
    await user.save();
    await post.save();
  } catch (error) {
    console.log(error.message);
  }
};
