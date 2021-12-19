const { Router } = require("express");
const {
  getLogin,
  postLogin,
  getRegister,
  postRegister,
  logout,
} = require("../controllers/auth.controller");

const router = Router();

router.get("/login", getLogin);

router.post("/login", postLogin);

router.get("/register", getRegister);

router.post("/register", postRegister);

router.get("/logout", logout);

module.exports = router;
