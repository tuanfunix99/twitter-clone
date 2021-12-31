const { Router } = require("express");
const { updateSeen } = require("../../controllers/api/nofication.controller");
const { auth } = require("../../middleware/auth");

const router = Router();

router.post("/seen", auth, updateSeen);

module.exports = router;
