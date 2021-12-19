const User = require("../models/user.model");
const log = require("../logger");
const { RegisterForm, LoginForm } = require("../utils/forms/user");

exports.getLogin = (req, res, next) => {
  const title = "Login";
  res.status(200).render("auth/login", { title, errors: null, input: null, forms: LoginForm });
};

exports.postLogin = async (req, res, next) => {
  const title = "Login";
  const { name, password } = req.body;
  const errors = {};
  const input = {
    name,
    password,
  };
  try {
    const user = await User.authenticate(name, password);
    req.session.user = {
      email: user.email,
      username: user.username,      
    };
    res.redirect('/');
  } catch (error) {
    log.error({ message: error.message }, "error register");
    if(error.name === 'ValidationError'){
      for (const property in error.errors) {
        errors[property] = error.errors[property].message;
      }
    }
    res.status(200).render("auth/login", { title, input, errors, forms: LoginForm });
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
    if(password !== confirm) {
      errors.confirm = 'Confirm not match';
    }
    const user = new User({ firstName, lastName, username, email, password });
    await user.save();
    res.redirect('/login');
  } catch (error) {
    if (error.name === "ValidationError") {
      for (const property in error.errors) {
        if(error.errors[property].kind === 'unique'){
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
  req.session.destroy(err => {
    res.redirect('/login');
  });
}
