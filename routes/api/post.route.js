const { Router } = require("express");
const { createNewPost } = require("../../controllers/api/post.controller");
const { auth } = require("../../middleware/auth");

const router = Router();

router.post("/post", auth, createNewPost);

module.exports = router;
