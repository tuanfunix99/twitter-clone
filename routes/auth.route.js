const { Router } = require("express");
const {
  getLogin,
  postLogin,
  getRegister,
  postRegister,
  logout,
  verify,
} = require("../controllers/auth.controller");

const router = Router();

router.get("/login", getLogin);

router.post("/login", postLogin);

router.get("/register", getRegister);

router.post("/register", postRegister);

router.get("/logout", logout);

router.get("/verify-email/:token", verify);

module.exports = router;
