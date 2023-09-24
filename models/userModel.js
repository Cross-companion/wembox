const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name in the required field'],
    trim: true,
    maxlength: [40, `A user's name must have 1 or more characters`],
    minlength: [1, `A user's name must have 1 or more characters`],
  },
  frontEndUsername: {
    type: String,
    maxlength: [15, `You username cannot be longer than 15 characters`],
    minlength: [1, 'You must have at least 1 valid character on your username'],
  },
  username: {
    type: String,
    maxlength: [15, `Your auth-username cannot be longer than 15 characters`],
    minlength: [1, 'You must have at least 1 valid character on your username'],
    required: [true, 'Please, a username is required to proceed e.g @example'],
    unique: [
      true,
      'Username has been taken by another user. Please choose another username.',
    ],
    lowercase: true,
    validate: {
      validator: function (value) {
        // Allows only alphanumeric characters and underscores
        return /^[A-Za-z_][A-Za-z0-9_]*$/.test(value);
      },
      message:
        'Invalid username format. Usernames can only contain letters, numbers, and underscores and must start with a letter or underscore.',
    },
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
  accountType: {
    type: String,
    enum: {
      values: process.env.ACCOUNT_TYPES.split(','),
      message: 'Invalid account type. Check your spellings and try again.',
    },
    default: 'user',
  },
  dateOfBirth: {
    type: Date,
    min: [
      new Date(`${new Date().getFullYear() - process.env.AGE_MAXIMUM}-01-01`),
      'Invalid date: Sorry, the date you specified is above our maximum age limit',
    ],
    max: [
      new Date(`${new Date().getFullYear() - process.env.AGE_MINIMUM}-01-01`),
      'Invalid date: Sorry, the date you specified is below our minimum age limit',
    ],
    required: [
      true,
      'Please tell us your date of birth so we can personalize you experience.',
    ],
  },
  interests: [String],
  interestsTopics: [String],
  shadowInterests: [String],
  shadowInterestsTopics: [String],
  password: {
    type: String,
    required: [true, `Please provide a password`],
    validate: {
      validator: function (value) {
        // Custom password validator function
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(
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
  wems: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Wem',
    },
  ],
  numberOfConstacts: Number,
  numberOfConstactRequests: Number,
  numberOfFollowing: Number,
  numberOfFollowers: Number,
  numberOfWems: Number,
  createdAt: {
    type: Date,
    default: Date.now(),
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

// Chats would be virtually Populated

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.isCorrectPassword = async (
  candidatePassword,
  encryptedPassword
) => {
  return bcrypt.compare(candidatePassword, encryptedPassword);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetTokenExpire = Date.now() + 1000 * 60 * 10;

  return resetToken;
};

userSchema.methods.isPasswordChanged = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    changedAt = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return changedAt > JWTTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
