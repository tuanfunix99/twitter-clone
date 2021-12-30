const { Router } = require("express");
const router = Router();
const { auth } = require("../middleware/auth");
const { noficationPage } = require("../controllers/nofication.controller");

router.get("/nofication/:username", auth, noficationPage);

module.exports = router;
