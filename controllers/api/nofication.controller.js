const Nofication = require("../../models/nofication.model");
const User = require("../../models/user.model");

exports.updateSeen = async (req, res, next) => {
  const { _id, userId } = req.body;
  try {
    const nof = await Nofication.findById(_id);
    const user = await User.findById(userId);
    if (nof.seen) {
      return;
    }
    nof.seen = true;
    if (user.noficationAmount > 0) {
      user.noficationAmount -= 1;
    }
    await nof.save();
    await user.save();
  } catch (error) {
    console.log(error.message);
  }
};
