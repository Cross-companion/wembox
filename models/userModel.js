const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name in the required field'],
    trim: true,
    maxlength: [40, `A user's name must have 1 or more characters`],
    minlength: [1, `A user's name must have 1 or more characters`],
  },
  username: {
    type: String,
    required: [true, 'Please, a username is required to proceed e.g @example'],
    maxlength: [15, `You username cannot be longer than 15 characters`],
    minlength: [1, 'You must have at least 1 valid character on your username'],
  },
  authUsername: {
    type: String,
    required: [true, 'Please, a username is required to proceed e.g @example'],
    unique: true,
    lowercase: true,
    maxlength: [15, 'You username cannot be longer than 15 characters'],
    minlength: [1, 'You must have at least 1 valid character on your username'],
    select: false,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email.'],
    maxlength: [
      100,
      `A user's email address must be less than or equal to 100 characters`,
    ],
    minlength: [
      5,
      `A user's email address must be greater than or equal to 5 characters`,
    ],
    select: false,
  },
  isHuman: {
    type: Boolean,
    default: false,
    select: false,
  },
  profileImg: {
    type: String,
    default: 'default-user.jpg',
  },
  profileBackgroungImg: {
    type: String,
    default: 'default-user-bkg.jpg',
  },
  acctType: {
    type: String,
    enum: {
      values: [
        'user',
        'verified-user',
        'verified-organization',
        'verified-enterprise',
        'governmental',
      ],
      message:
        'Account type can only either be: user, verified-user, verified-organisation, verified-enterprise, governmental',
    },
    default: 'user',
  },
  password: {
    type: String,
    required: [true, `Please provide a password`],
    validate: {
      validator: function (value) {
        // Custom password validator function
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
          value
        );
      },
      message:
        'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character.',
    },
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, `Please confirm your password`],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
    minlength: [
      8,
      'Your confirming password must not be less than 8 characters',
    ],
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpire: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
