const User = require('../models/user/userModel');
const factory = require('./handlerFactory');
const AppError = require('../utilities/AppError');
const catchAsync = require('../utilities/catchAsync');
const { clearUserFromCache } = require('../utilities/helpers');

exports.getAllUsers = factory.findAll(User);

// IMG Handling with AWS or its like would be done before initial organic Advertising.
exports.updateAtSignup = catchAsync(async (req, res, next) => {
  const {
    interests,
    contentType,
    profileImg,
    profileBackgroungImg,
    geoLocation,
  } = req.body;
  const conditionToContinue =
    interests?.length ||
    contentType?.length ||
    profileImg ||
    profileBackgroungImg ||
    geoLocation;

  if (!conditionToContinue)
    return next(new AppError('No data to update was specified.', 401));

  const userID = req.user._id;
  const update = {
    interests,
    contentType: contentType || interests,
    profileImg,
    profileBackgroungImg,
    geoLocation,
  };

  await User.findOneAndUpdate({ _id: userID }, update, { runValidators: true });
  clearUserFromCache(req.user);

  res.status(200).json({
    status: 'success',
  });
});
