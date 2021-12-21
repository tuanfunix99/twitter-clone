const Post = require("../../models/post.model");
const User = require("../../models/user.model");

exports.createNewPost = async (req, res, next) => {
  const { content } = req.body;
  try {
    const post = await Post.create({
      content: content,
      postedBy: req.user._id
    });
    await post.populate('postedBy');
    res.status(200).send(post);
  } catch (error) {
    res.status(400);
  }
};
