const mogoose = require("mongoose");
const { Schema } = mogoose;
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { Error } = require("mongoose");
const dotenv = require("dotenv");
const generator = require('generate-password');
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

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
  isActive: {
    type: Boolean,
    default: false,
  },
  token:{
    type: String,
  },
  avatar:{
    type: String,
    default: "/api/user-images/avatar/1640547515835-4f19859b-5877-4b3f-bca8-11ab567ce972"
  },
  background:{
    type: String,
    default: "/api/user-images/background/1640547595151-a562dbcd-706d-4df3-8b1b-84b90feddf54"
  },
  following: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  follower:[
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
});

userSchema.methods.setToken = function(){
  const user = this;
  const key_secret = generator.generate({
    length: 15,
    symbols: true
  })
  const token = jwt.sign({ _id: user._id, key_secret }, PRIVATE_KEY, { expiresIn: '24h' });
  return token;
}

userSchema.statics.authenticate = async (name, password) => {
  const username = await User.findOne({ username: name });
  const email = await User.findOne({ email: name });
  let error = new Error.ValidationError();
  if (!username && !email) {
    error.errors.name = new Error.ValidatorError({
      message: "Username or email not match",
      path: "name",
    });
    throw error;
  }
  const user = username ? username : email;
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    error.errors.password = new Error.ValidatorError({
      message: "Password not match",
      path: "password",
    });
    throw error;
  }
  return user;
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});


const User = mogoose.model("User", userSchema);

module.exports = User;
