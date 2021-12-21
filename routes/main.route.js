const { Router } = require("express");
const router = Router();
const { auth } = require("../middleware/auth");
const { main } = require("../controllers/main.controller");

router.get("/", auth, main);

module.exports = router;
