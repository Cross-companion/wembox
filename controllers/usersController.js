const User = require('../models/user/userModel');
const factory = require('./handlerFactory');
const AppError = require('../utilities/AppError');
const catchAsync = require('../utilities/catchAsync');

exports.getAllUsers = factory.findAll(User);

// IMG Handling with AWS or its like would be done before initial organic Advertising.
exports.updateAtSignup = catchAsync(async (req, res, next) => {
  let {
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

  if (!contentType) contentType = interests;

  const userID = req.user._id;
  const fieldsToUpdate = [
    { name: 'interests', value: interests },
    { name: 'contentType', value: contentType },
    { name: 'profileImg', value: profileImg },
    { name: 'profileBackgroungImg', value: profileBackgroungImg },
    { name: 'geoLocation', value: geoLocation },
  ];
  const update = {};

  fieldsToUpdate.forEach((field) => {
    if (field.value) update[field.name] = field.value;
  });

  await User.findOneAndUpdate({ _id: userID }, update, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    update,
  });
});
