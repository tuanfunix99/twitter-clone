const mogoose = require("mongoose");
const { Schema } = mogoose;
const validator = require("validator");
const bcrypt = require("bcrypt");
const uniqueValidator = require("mongoose-unique-validator");
const { Error } = require("mongoose");

const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "First Name is required"],
  },
  lastName: {
    type: String,
    required: [true, "Last Name is required"],
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email not valid");
      }
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password at least 8 chracters"],
    maxlength: [64, "Password max 64 characters"],
  },
});

userSchema.statics.authenticate = async (name, password) => {
  const username = await User.findOne({ username: name });
  const email = await User.findOne({ email: name });
  let error = new Error.ValidationError();
  if (!username && !email) {
    error.errors.name = new Error.ValidatorError({
      message: 'User not found',
      path: 'name',
    });
    throw error;
  }
  const user = username ? username : email;
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    error.errors.password = new Error.ValidatorError({
      message: 'Password not match',
      path: 'password',
    });
    throw error;
  }
  return user;
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.plugin(uniqueValidator);

const User = mogoose.model("User", userSchema);

module.exports = User;
