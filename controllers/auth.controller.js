const User = require("../models/user.model");
const log = require("../logger");
const { RegisterForm, LoginForm } = require("../utils/forms/user");
const nodemailer = require("nodemailer");
const { emailVerifyTemplate } = require("../utils/template/email");
const dotenv = require("dotenv");
const { Error } = require("mongoose");
const jwt = require('jsonwebtoken');
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
  const alert = req.query['new-account'];
  console.log(alert);
  res
    .status(200)
    .render("auth/login", {
      title,
      errors: null,
      input: null,
      forms: LoginForm,
      alert: alert
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
    if(!user.isActive){
      error.errors.name = new Error.ValidatorError({
        message: "User not actvie.Please check your email to actvie account",
        path: "name",
      });
      throw error; 
    }
    req.session.user = {
      email: user.email,
      username: user.username,
      isActive: user.isActive
    };
    res.redirect("/");
  } catch (error) {
    log.error({ message: error.message }, "error register");
    if (error.name === "ValidationError") {
      for (const property in error.errors) {
        errors[property] = error.errors[property].message;
      }
    }
    res
      .status(200)
      .render("auth/login", { title, input, errors, forms: LoginForm, alert: null });
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
  try {
    if (password !== confirm) {
      errors.confirm = "Confirm not match";
    }
    const user = new User({ firstName, lastName, username, email, password });
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
    console.log(error.name);
    if (error.name === "ValidationError") {
      for (const property in error.errors) {
        if (error.errors[property].kind === "unique") {
          errors[property] = `${error.errors[property].path} existed`;
          continue;
        }
        errors[property] = error.errors[property].message;
      }
    }
    log.error({ message: error.message }, "error register");
    res
      .status(200)
      .render("auth/register", { title, errors, input, forms: RegisterForm });
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
    const user = await User.findById(userDecode._id);
    if(!user){
      throw new Error('User not found');
    }
    if(user.token !== token){
      throw new Error('Token not exist');
    }
    user.isActive = true;
    user.token = '';
    await user.save();
    res.redirect('/login');
  } catch (error) {
    res.status(500).send(error.message);
  }
}
