const { Router } = require("express");
const {
  follow,
  uploadAvatar,
  searchUser,
  uploadBackground,
  getUserImages,
  resetNofication,
} = require("../../controllers/api/user.controller");
const { auth } = require("../../middleware/auth");
const {
  uploadAvatarMiddle,
  uploadBackgroundMiddle,
} = require("../../middleware/upload");

const router = Router();

router.post("/follow", auth, follow);

router.post("/upload-avatar", auth, uploadAvatarMiddle, uploadAvatar);

router.post(
  "/upload-background",
  auth,
  uploadBackgroundMiddle,
  uploadBackground
);

router.post("/search-user", auth, searchUser);

router.post("/reset-nofication", auth, resetNofication);

router.get("/user-images/:title/:key", auth, getUserImages);


module.exports = router;
