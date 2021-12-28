const { Router } = require("express");
const { createNewPost, deletePost } = require("../../controllers/api/post.controller");
const { auth } = require("../../middleware/auth");

const router = Router();

router.post("/post", auth, createNewPost);

router.post("/delete", auth, deletePost);

module.exports = router;
