const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const setFileStorge = (dir) => {
  const fileStorge = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, path.join(__dirname, "../uploads/" + dir));
    },
    filename: (req, file, callback) => {
      callback(null, new Date().getTime() + "-" + uuidv4() + ".png");
    },
  });
  return fileStorge;
};

const fileFilter = (req, file, callback) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg"
  ) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

exports.uploadAvatarMiddle = (req, res, next) => {
  const upload = multer({
    storage: setFileStorge("avatar"),
    fileFilter: fileFilter,
  }).single("avatar");
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).send(err.message);
    } else if (err) {
      return res.status(400).send(err.message);
    }
    next();
  });
};

exports.uploadBackgroundMiddle = (req, res, next) => {
  const upload = multer({
    storage: setFileStorge("background"),
    fileFilter: fileFilter,
  }).single("background");
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).send(err.message);
    } else if (err) {
      return res.status(400).send(err.message);
    }
    next();
  });
};
