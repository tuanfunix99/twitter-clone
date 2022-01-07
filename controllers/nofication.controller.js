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
    const profile = await User.findOne({ username: username }, "_id");
    if (!profile) {
      res.redirect("/not-found");
    }
    let nofs = await Nofication.find(
      {
        reciver: profile._id,
      },
      "_id content createdBy postId createdAt seen"
    )
    .sort({
      createdAt: -1,
    })
      .populate("createdBy", "username firstName lastName avatar")
      .populate({
        path: "postId",
        select: "postedBy",
        populate: {
          path: "postedBy",
          select: "username",
        },
      });

    for (let nof of nofs) {
      const { _id, content, createdBy, postId, createdAt, seen } = nof;
      if (postId && postId.postedBy) {
        const nofPost = {
          _id: postId._id,
          postedBy: {
            username: postId.postedBy.username,
          },
        };
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
