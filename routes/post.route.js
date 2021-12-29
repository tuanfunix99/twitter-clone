const { Router } = require("express");
const router = Router();
const { auth } = require("../middleware/auth");
const { postPage } = require("../controllers/post.controller");

router.get("/view-post/:username/:postId", auth, postPage);

module.exports = router;
