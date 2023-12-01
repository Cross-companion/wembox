const multer = require('multer');
const sharp = require('sharp');
const User = require('../../models/user/userModel');
const { multerStorage, multerFilter } = require('./helpers');
const factory = require('../handlerFactory');
const AppError = require('../../utilities/AppError');
const catchAsync = require('../../utilities/catchAsync');

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadProfileImages = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'profileCoverImage', maxCount: 1 },
]);

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  const { profileImage, profileCoverImage } = req.files;
  if (!profileImage && !profileCoverImage) return next();

  if (profileImage) {
    req.body.profileImage = `${process.env.PROFILE_IMAGE_PREFIX}-${
      req.user._id
    }-${Date.now()}.jpeg`;
    sharp(req.files.profileImage[0].buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/imgs/users/${req.body.profileImage}`);
  }

  if (profileCoverImage) {
    req.body.profileCoverImage = `${process.env.PROFILE_COVER_IMAGE_PREFIX}-${
      req.user._id
    }-${Date.now()}.jpeg`;
    sharp(req.files.profileCoverImage[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/imgs/users/${req.body.profileCoverImage}`);
  }

  next();
});

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
