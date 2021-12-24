const { Router } = require("express");
const { follow, uploadAvatar } = require("../../controllers/api/user.controller");
const { auth } = require("../../middleware/auth");
const { uploadAvatarMiddle } = require("../../middleware/upload");

const router = Router();

router.post("/follow", auth, follow);

router.post("/upload-avatar", auth, uploadAvatarMiddle, uploadAvatar);

module.exports = router
