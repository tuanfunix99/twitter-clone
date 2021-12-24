const Post = require("../../models/post.model");

exports.createNewPost = async (req, res, next) => {
  const { content, edit } = req.body;
  const io = req.app.get('socketIo');
  try {
    const post = await Post.create({
      content: content,
      postedBy: req.user._id
    });
    await post.populate('postedBy');
    if(edit){
      io.emit('edit', post);
    }
    else{
      io.emit('post', post);
    }
    res.status(200);
  } catch (error) {
    res.status(400);
  }
};
