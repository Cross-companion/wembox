const multer = require('multer');
const User = require('../../models/user/userModel');
const { multerStorage, multerFilter } = require('./helpers');
const factory = require('../handlerFactory');
const ImageFile = require('../../utilities/imageFileManager');
const AppError = require('../../utilities/AppError');
const catchAsync = require('../../utilities/catchAsync');
const { PROFILE_IMAGE_PREFIX, PROFILE_COVER_IMAGE_PREFIX } = process.env;

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadProfileImages = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'profileCoverImage', maxCount: 1 },
]);

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  let { profileImage, profileCoverImage } = req.files;
  if (!profileImage && !profileCoverImage) return next();

  const userID = req.user._id;
  profileImage = new ImageFile(profileImage[0], userID, PROFILE_IMAGE_PREFIX);
  profileCoverImage = new ImageFile(
    profileCoverImage[0],
    userID,
    PROFILE_COVER_IMAGE_PREFIX,
    [2000, 1333]
  );

  await Promise.all([
    profileImage.uploadToAWS(),
    profileCoverImage.uploadToAWS(),
  ]);

  req.body.profileImage = profileImage.imageName;
  req.body.profileCoverImage = profileCoverImage.imageName;
  next();
});

exports.getAllUsers = factory.findAll(User);

// IMG Handling with AWS or its like would be done before initial organic Advertising.
exports.updateAtSignup = catchAsync(async (req, res, next) => {
  let { interests, contentType, profileImage, profileCoverImage, geoLocation } =
    req.body;
  const conditionToContinue =
    interests?.length ||
    contentType?.length ||
    profileImage ||
    profileCoverImage ||
    geoLocation;

  if (!conditionToContinue)
    return next(new AppError('No data to update was specified.', 401));

  if (!contentType) contentType = interests;

  const userID = req.user._id;
  const fieldsToUpdate = [
    { name: 'interests', value: interests },
    { name: 'contentType', value: contentType },
    { name: 'profileImage', value: profileImage },
    { name: 'profileCoverImage', value: profileCoverImage },
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
