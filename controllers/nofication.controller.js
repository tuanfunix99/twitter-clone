const User = require("../models/user.model");
const Nofication = require("../models/nofication.model");
const Post = require("../models/post.model");
const { getAvatar } = require("../utils/file/user");
const {
  getAmountNofication,
  getNoficationContent,
} = require("../utils/helper");

exports.noficationPage = async (req, res, next) => {
  const user = req.user;
  const { username } = req.params;
  const isUser = username === user.username;
  const nofications = [];
  try {
    if (!isUser) {
      res.redirect("/not-found");
    }
    const profile = await User.findOne(
      { username: username },
      "_id nofications"
    ).populate("nofications", "_id createdBy content postId seen createdAt");
    if (!profile) {
      res.redirect("/not-found");
    }
    const nofs = profile.nofications.sort(
      (p1, p2) =>
        new Date(p2.createdAt).getTime() - new Date(p1.createdAt).getTime()
    );
    for (let nofication of nofs) {
      const { _id, content, createdBy, postId, createdAt, seen } =
        await nofication.populate(
          "createdBy",
          "username firstName lastName avatar"
        );
      const nofPost = await Post.findById(postId, "postedBy").populate(
        "postedBy",
        "username"
      );
      if (nofPost) {
        const nofTemplate = getNoficationContent({
          _id,
          content,
          createdBy,
          nofPost,
          createdAt,
          seen,
        });
        if (nofTemplate) {
          nofications.push(nofTemplate);
        }
      }
    }
    res.render("nofication", {
      title: "Nofication",
      user,
      nofications,
      getAvatar,
      isUser,
      noficationAmount: getAmountNofication(0),
    });
  } catch (error) {
    console.log(error);
  }
};
