const { Router } = require("express");
const { userProfile } = require('../controllers/user.controller');
const { auth } = require("../middleware/auth");

const router = Router();

router.get('/user-profile/:username', auth, userProfile);

module.exports = router;
