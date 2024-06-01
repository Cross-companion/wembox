const validator = require('validator');
const fs = require('fs');
const { promisify } = require('util');

const jwt = require('jsonwebtoken');
const request = require('request');
const crypto = require('crypto');
const Reader = require('@maxmind/geoip2-node').Reader;

const User = require('../models/user/userModel');
const Follow = require('../models/follow/followModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/AppError');
const Email = require('../utilities/email');
const {
  generateRandomToken,
  getIPAddress,
  getLocationByIP,
} = require('../utilities/helpers');
const redis = require('../utilities/redisInit');
const DocumentMethods = require('../utilities/DocumentMethods');
const { getContactsQuery } = require('./contact/helper');

const signToken = (claims) => {
  return jwt.sign(claims, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (res, user, statusCode) => {
  const token = signToken({ id: user._id, username: user.username });
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 1000 * 60 * 60 * 24
    ),
    secure: false, // SET TO TRUE WHEN SSL IS SET
    httpOnly: true,
  };
  if (process.env.NODE_ENV !== 'production') cookieOptions.secure = false;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    user,
  });
};

exports.dataExists = catchAsync(async (req, res, next) => {
  let { email, username } = req.body;
  const isEmail = email ? await validator.isEmail(email) : true;

  if (!isEmail)
    return next(new AppError(`Invalid email address ${email}`, 400));

  const otherUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (otherUser) {
    const emailIsTaken = otherUser.email == email;
    const contradictingData = emailIsTaken
      ? `email '${email}'`
      : `username '${username}'`;
    return next(
      new AppError(
        `The ${contradictingData} already exist in our data base. Try login if it's yours.`,
        400
      )
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'There is an available name sapce for specified data',
  });
});

exports.recaptcha = catchAsync(async (req, res, next) => {
  const recaptchaResponse = req.body.recaptcha;
  const verifyURL = `${process.env.RECATPCHA_VERIFY_URL}?secret=${process.env.RECATPCHA_SECRET_KEY}&response=${recaptchaResponse}&remoteip=${req.connection.remoteAddress}`;

  request(verifyURL, (err, response, body) => {
    body = JSON.parse(body);
    if (body.success === true) {
      req.isHuman = true;
      return next();
    } else return next(new AppError('Your verification failed'));
  });
});

exports.sendEmailOtp = catchAsync(async (req, res, next) => {
  const { email, name = 'user' } = req.body;
  if (!email)
    return next(
      new AppError(
        'Please provide your email address to get a verification email.',
        400
      )
    );

  const token = generateRandomToken();
  const emailKey = process.env.EMAIL_CACHE_KEY + email;
  await redis.set(emailKey, token, 'ex', process.env.REDIS_VERIFICATION_EXP);

  try {
    await new Email({
      user: { email, name },
      otp: token,
    }).sendEmailVerificationOTP();
  } catch (err) {
    console.log(err);
    return next(
      new AppError(
        'There was a short server error, please try again and if problem persist, contact the wembox customer service.'
      )
    );
  }

  // await sendEmail({
  //   email,
  //   subject: 'Wembox verification token. (Expires in 10 minutes)',
  //   message,
  // });

  res.status(200).json({
    status: 'success',
    message: `6 digit otp has been sent to ${email}.`,
  });
});

exports.verifyEmailOtp = catchAsync(async (req, res, next) => {
  const { email, emailOTP } = req.body;
  if (!email)
    return next(
      new AppError(
        'Please provide your email address for the confirmation of your otp.',
        400
      )
    );
  if (!emailOTP)
    return next(new AppError('Invalid token. Input your token and try again.'));

  const emailKey = process.env.EMAIL_CACHE_KEY + email;
  const originalToken = await redis.get(emailKey);

  if (!originalToken) return next(new AppError('Your token expired.', 404));

  if (emailOTP !== originalToken)
    return next(new AppError('Incorrect token. Try again.'));

  res.status(200).json({
    status: 'success',
    message: `Email verification successful.`,
  });
});

exports.signup = catchAsync(async (req, res, next) => {
  const userIP = getIPAddress(req);
  const userLocation = await getLocationByIP(userIP);

  const { isHuman } = req;
  if (!isHuman)
    return next(
      new AppError(
        'This process has not been verified to be humanly initiated',
        401
      )
    );

  const newUser = await User.create({
    name: req.body.name,
    frontEndUsername: req.body.username,
    username: req.body.username,
    email: req.body.email,
    dateOfBirth: req.body.dateOfBirth,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    isHuman: req.isHuman, // from recaptcha
    IPGeoLocation: userLocation,
  });

  const homeUrl = `${req.protocol}://${req.get('host')}/`;
  // const message = `Hello ${req.body.name}, \nIt is with great pleasure that we welcome you to wembee, A place where you can meet your people and build new memories together.\nNwodoh Daniel\nLead-member`;

  await new Email({ user: newUser, url: homeUrl }).sendWelcome();

  createSendToken(res, newUser, 200);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, username, password } = req.body;

  if (!password || !(username || email))
    return next(
      new AppError(
        `Incorrect details. Please input your correct ${
          username ? 'username' : 'email'
        } or password`,
        400
      )
    );

  const user = email
    ? await User.findOne({ email }).select('password username')
    : await User.findOne({ username }).select('password username');

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

exports.logout = catchAsync(async (req, res, next) => {
  const userKey = `${process.env.USER_CACHE_KEY}${req.user?._id}`;
  redis.del(userKey);

  res.cookie('jwt', '', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  return res.redirect('/');
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.accountType)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

/**
 * Since this user is cached, it looses all it document methods, any document method used after here must be defined in and called from the DocumentMethods class.
 */
exports.protect = async (req, res, next) => {
  try {
    const jwtParsedByHeader = req.headers?.authorization?.startsWith('Bearer')
      ? req.headers?.authorization?.split(' ')[1]
      : '';
    let token = req.cookies.jwt ?? jwtParsedByHeader;

    if (!token) throw new Error();
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    if (!decoded)
      throw new Error('Your session has exprired. Please login again.');

    const userKey = `${process.env.USER_CACHE_KEY}${decoded.id}`;
    const cachedUser = JSON.parse(await redis.get(userKey));
    const user =
      cachedUser ||
      (await User.findById(decoded.id).select('+interests +contentType'));

    if (!user) throw new Error('Sorry, this User no longer exits.');
    if (DocumentMethods.isPasswordChanged(user, decoded.iat)) {
      throw new Error(
        'Looks like you have changed your password. Please login with your new password'
      );
    }
    if (!cachedUser) {
      await redis.set(
        userKey,
        JSON.stringify(user),
        'ex',
        process.env.REDIS_USER_EXP
      );
    }

    req.user = user;
    res.locals.user = user; // Store in response locals for possible rendering
    // console.log(
    //   `${req.user.username}: ${req.user.IPGeoLocation.city}, ${req.user.IPGeoLocation.country}`
    // );
    return next();
  } catch (err) {
    res.redirect('/auth');
  }
};

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
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/reset-password/${resetToken}`;

    const message = `Hello ${
      user.name?.split(' ')[0] || 'dear user'
    } you can reset your password at ${resetUrl}.\n Copy and paste the link into you browser into your favourite browser.`;

    await new Email({ user, url: resetUrl }).sendPasswordReset();

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'The email has been sent',
    });
  } catch (err) {
    console.log(err);
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
  const { password, passwordConfirm, token } = req.body;

  if (!password || !passwordConfirm)
    return next(
      new AppError('Please provide a new password and Password confirmation')
    );

  if (password !== passwordConfirm)
    return next(
      new AppError('Your new password is different from your password confirm')
    );

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

// USED TO POPULATE COUNTRYREGIONS.JSON remove if no longer useful.
// const url = 'https://restcountries.com/v3.1/all';
// request(url, (err, response, body) => {
//   body = JSON.parse(body);

//   console.log(body[0]);
//   const data = JSON.stringify(
//     body.map((country) => {
//       const name = country.name.common?.toLowerCase();
//       const region = country.subregion?.toLowerCase();
//       return {
//         name,
//         region,
//       };
//     })
//   );
//   // Write the data to the file
//   fs.writeFile('./config/countryRegions.json', data, (err) => {
//     if (err) {
//       console.error('Error writing to the file:', err);
//     } else {
//       return;
//     }
//   });
// });
