const { Router } = require("express");
const {
  getLogin,
  postLogin,
  getRegister,
  postRegister,
  logout,
  verify,
  getForgotPassword,
  postForgotPassword,
  getResetPassword,
  resetPassword,
  postResetPassword,
} = require("../controllers/auth.controller");

const router = Router();

router.get("/login", getLogin);

router.post("/login", postLogin);

router.get("/register", getRegister);

router.post("/register", postRegister);

router.get("/forgot-password", getForgotPassword);

router.post("/forgot-password", postForgotPassword);

router.get("/reset-password-form", getResetPassword);

router.post("/reset-password-form", postResetPassword);

router.get("/logout", logout);

router.get("/verify-email/:token", verify);

router.get("/reset-password/:token", resetPassword);

module.exports = router;
