const { Router } = require("express");
const { follow, uploadAvatar } = require("../../controllers/api/user.controller");
const { auth } = require("../../middleware/auth");

const router = Router();

router.post("/follow", auth, follow);

router.post("/upload-avatar", auth, uploadAvatar);

module.exports = router
