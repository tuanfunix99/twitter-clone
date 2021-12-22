const Post = require("../../models/post.model");

exports.createNewPost = async (req, res, next) => {
  const { content } = req.body;
  const io = req.app.get('socketIo');
  try {
    const post = await Post.create({
      content: content,
      postedBy: req.user._id
    });
    await post.populate('postedBy');
    io.emit('respone', post);
    res.status(200);
  } catch (error) {
    res.status(400);
  }
};
