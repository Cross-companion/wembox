const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const request = require('request');
const crypto = require('crypto');
const ip = require('ip');
const Redis = require('ioredis');

const User = require('../models/user/userModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/AppError');
const sendEmail = require('../utilities/email');
const helpers = require('../utilities/helpers');
const userConfig = require('../config/userConfig');

// ---?? Redis disabled for testing
// const redis = new Redis({
//   host: process.env.REDIS_HOST,
//   port: process.env.REDIS_PORT,
// });

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (res, user, statusCode) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 1000 * 60 * 60 * 24
    ),
    secure: true,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'development') cookieOptions.secure = false;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    user,
  });
};

exports.dataExists = catchAsync(async (req, res, next) => {
  let emailExists, usernameExists;

  const { email, username } = req.body;
  if (email && !username) {
    emailExists = (await User.findOne({ email })) ? true : false;

    res.status(200).json({
      status: 'success',
      emailExists,
    });
  } else if (username && !email) {
    usernameExists = (await User.findOne({ username })) ? true : false;

    res.status(200).json({
      status: 'success',
      usernameExists,
    });
  } else if (username && email)
    return next(
      new AppError('This route verifies only one email or username', 400)
    );
  else
    return next(
      new AppError(`Please provide a username or an email to be verified`, 400)
    );
});

exports.captcha = catchAsync(async (req, res, next) => {
  const captchaResponse = req.body.captcha;
  const verifyURL = `${process.env.RECATPCHA_VERIFY_URL}?secret=${process.env.RECATPCHA_SECRET_KEY}&response=${captchaResponse}&remoteip=${req.connection.remoteAddress}`;

  request(verifyURL, (err, response, body) => {
    body = JSON.parse(body);
    if (body.success === true) {
      return next();
    } else return next(new AppError('Your verification failed'));
  });
});

exports.sendEmailOtp = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  if (!email)
    return next(
      new AppError(
        'Please provide your email address to get a verification email.',
        400
      )
    ); // Contemplating. this is the only email because because it would still undergo token and DB verification
  const token = helpers.generateRandomToken();
  const emailKey = process.env.EMAIL_CACHE_KEY + email;
  redis.set(emailKey, token, 'ex', process.env.REDIS_VERIFICATION_EXP);
  const message = `Hello ${req.body.name}, \nYour email verification token is: ${token}.\n Please do not share this with anyone. Thanks.\nNwodoh Daniel\nLead-member`;

  await sendEmail({
    email,
    subject: 'Wembox verification token. (Expires in 10 minutes)',
    message,
  });

  res.status(200).json({
    status: 'success',
    message: 'Verification passed and 6 digit otp has been sent to email.',
  });
});

exports.verifyEmailOtp = catchAsync(async (req, res, next) => {
  const { email, emailOtp } = req.body;
  if (!email)
    return next(
      new AppError(
        'Please provide your email address for the confirmation of your otp.',
        400
      )
    );
  if (!emailOtp)
    return next(new AppError('Invalid token. Input your token and try again.'));

  const emailKey = process.env.EMAIL_CACHE_KEY + email;
  const originalToken = await redis.get(emailKey);

  if (!originalToken) return next(new AppError('Your token expired.', 404));

  if (emailOtp !== originalToken)
    return next(new AppError('Incorrect token. Try again.'));

  next();
});

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    frontEndUsername: req.body.username,
    username: req.body.username,
    email: req.body.email,
    dateOfBirth: req.body.dateOfBirth,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    following: req.body.following,
    contentType: req.body.contentType,
    interests: req.body.interests,
  });

  const message = `Hello ${req.body.name}, \nIt is with great pleasure that we welcome you to wembee, A place where you can meet your people and build new memories together.\nNwodoh Daniel\nLead-member`;

  await sendEmail({
    email: req.body.email,
    subject: 'Welcome to WEMBOX!!',
    message,
  });

  createSendToken(res, newUser, 200);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, username, password } = req.body;

  if (!password || (!username && !email))
    return next(
      new AppError(
        `Incorrect details. Please input your correct ${
          username ? 'username' : 'email'
        } or password`,
        400
      )
    );

  const user = email
    ? await User.findOne({ email }).select('password')
    : await User.findOne({ username }).select('password');

  if (!user || !(await user?.isCorrectPassword(password, user?.password)))
    return next(
      new AppError(
        `Incorrect details. Please input your correct ${
          username ? 'username' : 'email'
        } or password`,
        400
      )
    );

  createSendToken(res, user, 200);
});

exports.logout = (req, res) => {
  res.cookie('jwt', '', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(req.user.accountType);
    if (!roles.includes(req.user.accountType)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.protect = catchAsync(async (req, res, next) => {
  const jwtPasedByHeader = req.headers?.authorization?.startsWith('Bearer')
    ? req.headers?.authorization?.split(' ')[1]
    : '';
  let token = req.cookies.jwt ?? jwtPasedByHeader;
  if (!token) {
    return next(
      new AppError(
        'Hey there, You are not logged in!. Please login to continue',
        401
      )
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  if (!decoded) return next(new AppError('Invalid JWT', 401));

  // Checks if user still exists (using the ID because it is used to create the jwt)
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('Sorry, this User no longer exits.', 404));
  }
  if (user.isPasswordChanged(decoded.iat)) {
    return next(
      new AppError(
        'Looks like you have changed your password. Please login with your new password'
      )
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = user;
  res.locals.user = user; // Store in response locals for possible rendering
  return next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email, username } = req.body;

  if (!email && !username)
    return next(new AppError('Please specify a username or email', 400));

  const user = email
    ? await User.findOne({ email })
    : await User.findOne({ username });

  if (!user) {
    return next(
      new AppError(
        `This ${email ? 'email' : 'username'} does not exist on our database`
      )
    );
  }

  const resetToken = user.createPasswordResetToken();

  try {
    const resetUrl = `${req.protocol}//${req.get(
      'host'
    )}/api/v1/users/reset-password/${resetToken}`;

    const message = `Reset your password at ${resetUrl}`;

    await sendEmail({
      email: user.email,
      subject: 'Reset Your wembox password (Expires in 10 minutes).',
      message,
    });

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'The email has been sent',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Please try again',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  if (!password || !passwordConfirm)
    return next(
      new AppError('Please provide a new password and Password confirmation')
    );

  if (password !== passwordConfirm)
    return next(
      new AppError('Your new password is different from your password confirm')
    );

  const token = req.params.token;
  const hashedPassword = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedPassword,
    passwordResetTokenExpire: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Token is invalid or has expired', 400));

  user.password = password;
  user.passwordConfirm = passwordConfirm;

  user.passwordResetToken = undefined;
  user.passwordResetTokenExpire = undefined;

  user.passwordChangedAt = Date.now();

  await user.save();

  createSendToken(res, user, 201);
});
