const User = require("../models/user.model");
const log = require("../logger");
const { RegisterForm, LoginForm } = require("../utils/forms/user");
const nodemailer = require("nodemailer");
const { emailVerifyTemplate } = require("../utils/template/email");
const dotenv = require("dotenv");
const { Error } = require("mongoose");
const jwt = require("jsonwebtoken");
dotenv.config();

const ROOT_DOMAIN = process.env.ROOT_DOMAIN;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

exports.getLogin = (req, res, next) => {
  const title = "Login";
  const alert = req.query["new-account"];
  res.status(200).render("auth/login", {
    title,
    errors: null,
    input: null,
    forms: LoginForm,
    alert: alert,
  });
};

exports.postLogin = async (req, res, next) => {
  const title = "Login";
  const { name, password } = req.body;
  const errors = {};
  const input = {
    name,
    password,
  };
  let error = new Error.ValidationError();
  try {
    const user = await User.authenticate(name, password);
    if (!user.isActive) {
      error.errors.name = new Error.ValidatorError({
        message: "Account not actvie.Please check your email to actvie account",
        path: "name",
      });
      throw error;
    }
    req.session.user = {
      _id: user._id,
      isActive: user.isActive,
    };
    res.redirect("/");
  } catch (error) {
    log.error({ message: error.message }, "error register");
    if (error.name === "ValidationError") {
      for (const property in error.errors) {
        errors[property] = error.errors[property].message;
      }
    }
    res.status(400).render("auth/login", {
      title,
      input,
      errors,
      forms: LoginForm,
      alert: null,
    });
  }
};

exports.getRegister = (req, res, next) => {
  const title = "Register";
  res.status(200).render("auth/register", {
    title,
    errors: null,
    input: null,
    forms: RegisterForm,
  });
};

exports.postRegister = async (req, res, next) => {
  //hoaingo.26061999@gmail.com
  const title = "Register";
  const { firstName, lastName, username, email, password, confirm } = req.body;
  const input = {
    firstName,
    lastName,
    username,
    email,
    password,
    confirm,
  };
  const errors = {};
  let error = new Error.ValidationError();
  try {
    if (password !== confirm) {
      error.errors.confirm = new Error.ValidatorError({
        message: "Confirm not match",
        path: "confirm",
      });
      throw error;
    }
    const user = new User({ firstName, lastName, username, email, password });
    await user.save();
    user.token = user.setToken();
    await transporter.sendMail({
      from: "ADMIN",
      to: user.email,
      subject: "Token Verify",
      text: "Please click the link below to verify your email",
      html: emailVerifyTemplate(
        `<a href="${ROOT_DOMAIN}/verify-email/${user.token}"class="button button--blue">Verify Email</a>`
      ),
    });
    await user.save();
    res.redirect("/login?new-account=true");
  } catch (error) {
    if (error.name === "ValidationError") {
      for (const property in error.errors) {
        if (error.errors[property].kind === "unique") {
          continue;
        }
        errors[property] = error.errors[property].message;
      }
    } else if (error.name === "MongoServerError" && error.code === 11000) {
      const property = Object.keys(error.keyPattern)[0];
      errors[property] = `${property} is already taken`;
    }
    log.error({ message: error.message }, "error register");
    res
      .status(400)
      .render("auth/register", { title, errors, input, forms: RegisterForm });
  }
};

exports.getForgotPassword = (req, res, next) => {
  res.render("auth/forgot-password", {
    title: "Forgot Password",
    errors: null,
    input: null,
    confirm: false,
  });
};

exports.postForgotPassword = async (req, res, next) => {
  const errors = {};
  const input = { email: "" };
  const { email } = req.body;
  let error = new Error.ValidationError();
  try {
    if (!email || email.trim().length === 0) {
      error.errors.email = new Error.ValidatorError({
        message: "Email is required",
        path: "email",
      });
      throw error;
    }
    input.email = email;
    const user = await User.findOne({ email: email }, "email token isActive");
    if (!user) {
      error.errors.email = new Error.ValidatorError({
        message: "Email not found",
        path: "email",
      });
      throw error;
    }
    if (!user.isActive) {
      error.errors.email = new Error.ValidatorError({
        message: "Account not active",
        path: "email",
      });
      throw error;
    }
    user.token = user.setToken();
    await transporter.sendMail({
      from: "ADMIN",
      to: user.email,
      subject: "Token Verify",
      text: "Please click the link below to reset your passord",
      html: emailVerifyTemplate(
        `<a href="${ROOT_DOMAIN}/reset-password/${user.token}"class="button button--blue">Reset Password</a>`
      ),
    });
    await user.save();
    res.status(200).render("auth/forgot-password", {
      title: "Forgot Password",
      errors: null,
      input: null,
      confirm: true,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      for (const property in error.errors) {
        errors[property] = error.errors[property].message;
      }
    }
    res.status(400).render("auth/forgot-password", {
      title: "Forgot Password",
      errors: errors,
      input: input,
      confirm: false,
    });
  }
};

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/login");
  });
};

exports.verify = async (req, res, next) => {
  const token = req.params.token;
  try {
    const userDecode = jwt.verify(token, PRIVATE_KEY);
    let user = await User.findById(userDecode._id);
    if (!user) {
      throw new Error("User not found");
    }
    if (user.token !== token) {
      throw new Error("Token not exist");
    }
    user.isActive = true;
    user.token = "";
    await user.save();
    res.redirect("/login");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.resetPassword = async (req, res, next) => {
  const token = req.params.token;
  try {
    const userDecode = jwt.verify(token, PRIVATE_KEY);
    let user = await User.findById(
      userDecode._id,
      "token isActive email isReset"
    );
    if (!user) {
      throw new Error("User not found");
    }
    if (user.token !== token) {
      throw new Error("Token not exist");
    }
    if (!user.isActive) {
      throw new Error("Account not active");
    }
    user.isReset = true;
    user.token = "";
    await user.save();
    res.redirect(`/reset-password-form?email=${user.email}`);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getResetPassword = async (req, res, next) => {
  const { email } = req.query;
  try {
    if (!email) {
      return res.redirect("/login");
    }
    const user = await User.findOne({ email: email }, "token isReset  ");
    if (!user) {
      return res.status(500).send("Email not found");
    } else if (!user.isReset || user.token !== "") {
      return res.status(500).send("Reset not active");
    }
    res.status(200).render('auth/reset-password', {
      title: "Reset Password",
      errors: null,
      input: null,
      success: false
    });
  } catch (error) {}
};

exports.postResetPassword = async (req, res, next) => {
  const { email } = req.query;
  const { password, confirm } = req.body;
  const errors = {};
  const input = { password: password, confirm: confirm };
  let error = new Error.ValidationError();
  try {
    if (!email) {
      return res.redirect("/login");
    }
    const user = await User.findOne({ email: email }, "token isReset password");
    if (!user) {
      return res.status(500).send("Email not found");
    } else if (!user.isReset || user.token !== "") {
      return res.status(500).send("Reset not active");
    }
    if (!password || password.trim().length === 0) {
      error.errors.password = new Error.ValidatorError({
        message: "Password is required",
        path: "password",
      });
      throw error;
    }
    if (password.trim().length < 8 || password.trim().length > 64) {
      error.errors.password = new Error.ValidatorError({
        message: "Password at least 8 characters and max 64 characters",
        path: "password",
      });
      throw error;
    }
    if (password !== confirm) {
      error.errors.confirm = new Error.ValidatorError({
        message: "Confirm not match",
        path: "confirm",
      });
      throw error;
    }
    user.password = password;
    user.isReset = false;
    await user.save();
    res.status(200).render('auth/reset-password', {
      title: "Reset Password",
      errors: null,
      input: null,
      success: true
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      for (const property in error.errors) {
        errors[property] = error.errors[property].message;
      }
    }
    res.status(400).render('auth/reset-password', {
      title: "Reset Password",
      errors: errors,
      input: input,
      success: false
    });
  }
};
