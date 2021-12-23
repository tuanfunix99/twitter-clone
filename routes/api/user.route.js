const { Router } = require("express");
const { follow } = require("../../controllers/api/user.controller");
const { auth } = require("../../middleware/auth");

const router = Router();

router.post("/follow", auth, follow);

module.exports = router;
