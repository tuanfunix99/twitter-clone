const { Router } = require("express");
const { userProfile } = require('../controllers/user.controller');
const { auth } = require("../middleware/auth");

const router = Router();

router.get('/user-page/:username', auth, userProfile);

module.exports = router;
