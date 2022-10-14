const mongoose = require('mongoose');
const validator = require('validator');
const bcrybt = require('bcrypt');

const userShema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, `Please tell us your name`],
    unique: true,
    trim: true,
    maxLength: [40, `The user name lenth must be below 40 `],
    minLength: [4, `The user name lenth above 10`],
  },
  email: {
    type: String,
    lowercase: true,
    required: [true, `Please provide your email`],
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, `Please provide a password`],
    minLength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, `Please provide confirm your password`],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords must be the same',
    },
  },
});

userShema.pre('save', async function (next) {
  //This is happen if the password hass been modified
  if (!this.isModified('password')) return next();
  //For hassing the password
  this.password = await bcrybt.hash(this.password, 12);
  //drop PasswodConfirm fileld
  this.passwordConfirm = undefined;
  next();
});

const User = mongoose.model('User', userShema);

module.exports = User;
