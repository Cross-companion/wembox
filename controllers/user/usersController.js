const multer = require('multer');
const User = require('../../models/user/userModel');
const {
  multerStorage,
  multerFilter,
  updateChosenAtSignup,
} = require('./helpers');
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
  profileImage = new ImageFile({
    image: profileImage[0],
    uniqueID: userID,
    prefix: PROFILE_IMAGE_PREFIX,
  });
  profileCoverImage = new ImageFile({
    image: profileCoverImage[0],
    uniqueID: userID,
    prefix: PROFILE_COVER_IMAGE_PREFIX,
    resize: [2000, 1333],
  });

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
exports.setInterests = catchAsync(async (req, res, next) => {
  const userID = req.user._id;
  let { interests } = req.body;
  const contentType = interests;

  if (!interests?.length)
    return next(new AppError('No interests was specified.', 401));

  const update = { interests, contentType };
  await User.findByIdAndUpdate({ _id: userID }, update);
  await updateChosenAtSignup(interests.map((interest) => interest.topic));

  res.status(200).json({
    status: 'success',
    update,
  });
});
