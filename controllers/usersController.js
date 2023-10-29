const Follow = require('../models/follow/followModel');
const User = require('../models/user/userModel');
const factory = require('./handlerFactory');
const AppError = require('../utilities/AppError');
const catchAsync = require('../utilities/catchAsync');
const helper = require('../utilities/helpers');
const interestConfig = require('../config/interestConfig');

const populateFollowItems = [
  'name frontEndUsername profileImg accountType numberOfFollowers numberOfFollowing',
];

exports.getAllUsers = factory.findAll(User);

exports.follow = catchAsync(async (req, res, next) => {
  // 1. create a new follow document with the appropriate parameters
  const follower = req.user.id;
  const { following } = req.body;
  console.log(follower, following);
  if (!follower || !following) {
    return next(
      new AppError(
        'No user to follow was specified. Please specify a user and try again.',
        400
      )
    );
  }
  if (follower === following) {
    return next(
      new AppError(
        'Uh oh, you tried to follow your same account. Follow another user and try again.',
        400
      )
    );
  }

  const createFollow = await Follow.create({ follower, following });

  // 2. add an increment to the appropriate fields of both the follower and the following
  await User.findByIdAndUpdate(
    { _id: follower },
    { $inc: { numberOfFollowing: 1 } }
  );
  await User.findByIdAndUpdate(
    { _id: following },
    { $inc: { numberOfFollowers: 1 } }
  );

  res.status(200).json({ status: 'success', follow: createFollow });
});

exports.getFollowers = catchAsync(async (req, res, next) => {
  const findBy = { following: req.params.user_id || req.user.id };
  const populateBy = ['follower'];
  factory.findAll(Follow, {
    findBy,
    populateOptions: populateBy,
    populateData: populateFollowItems,
  })(req, res, next);
});

exports.getFollowings = catchAsync(async (req, res, next) => {
  const findBy = { follower: req.params.user_id || req.user.id };
  const populateBy = ['following'];
  factory.findAll(Follow, {
    findBy,
    populateOptions: populateBy,
    populateData: populateFollowItems,
  })(req, res, next);
});

exports.getAllFollows = factory.findAll(Follow, {
  populateOptions: ['following', 'follower'],
  populateData: [...populateFollowItems, ...populateFollowItems],
});

exports.unfollow = catchAsync(async (req, res, next) => {
  const { following } = req.body;
  const follower = req.user.id;

  if (follower === following)
    return next(new AppError('You are unable to unfollow your account.'));
  const deletedFollow = await Follow.findOneAndDelete({ follower, following });
  if (!deletedFollow)
    return next(new AppError('You do not yet follow this account.', 404));

  await User.findByIdAndUpdate(
    { _id: follower },
    { $inc: { numberOfFollowing: -1 } }
  );
  await User.findByIdAndUpdate(
    { _id: following },
    { $inc: { numberOfFollowers: -1 } }
  );
  res.status(200).json({
    status: 'success',
  });
});

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

  req.status(200).json({
    status: 'success',
  });
});
