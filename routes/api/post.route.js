const { Router } = require("express");
const { createNewPost, deletePost, loadPost, updatePost } = require("../../controllers/api/post.controller");
const { auth } = require("../../middleware/auth");

const router = Router();

router.post("/post", auth, createNewPost);

router.post("/delete", auth, deletePost);

router.post("/load", auth, loadPost);

router.post("/update", auth, updatePost);

module.exports = router;
