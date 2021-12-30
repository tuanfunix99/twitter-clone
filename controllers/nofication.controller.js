const User = require("../models/user.model");
const Nofication = require("../models/nofication.model");
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
    ).populate("nofications", "_id createdBy content postId createdAt");
    if (!profile) {
      res.redirect("/not-found");
    }
    const nofs = profile.nofications.sort(
      (p1, p2) =>
        new Date(p2.createdAt).getTime() - new Date(p1.createdAt).getTime()
    );
    for (let nofication of nofs) {
      const { content, createdBy, postId, createdAt } =
        await nofication.populate(
          "createdBy",
          "username firstName lastName avatar"
        );
      const nofTemplate = getNoficationContent({
        content,
        createdBy,
        postId,
        createdAt,
      });
      if (nofTemplate) {
        nofications.push(nofTemplate);
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
