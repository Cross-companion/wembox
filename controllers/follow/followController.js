const Follow = require('../../models/follow/followModel');
const User = require('../../models/user/userModel');
const factory = require('../handlerFactory');
const AppError = require('../../utilities/AppError');
const catchAsync = require('../../utilities/catchAsync');
const { updateEngagements } = require('../handlerFactory');
const { engagementScores } = require('../../config/suggestionConfig');

const populateFollowItems = [
  'name frontEndUsername profileImage accountType numberOfFollowers numberOfFollowing',
];

exports.follow = catchAsync(async (req, res, next) => {
  // 1. create a new follow document with the appropriate parameters
  const follower = req.user._id;
  const { following, followBasis } = req.body;
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

  try {
    const createFollow = await Follow.create({ follower, following });

    const newTopicObj = {
      topic: followBasis.topic,
      interest: followBasis.interest,
      engagements: engagementScores.follow,
    };

    // update person following.
    await updateEngagements(
      User,
      follower,
      { 'interests.topic': newTopicObj.topic },
      { interests: newTopicObj },
      {
        numberOfFollowing: 1,
      },
      { 'interests.$.engagements': engagementScores.follow }
    );

    // update person being followed.
    await updateEngagements(
      User,
      following,
      { 'contentType.topic': newTopicObj.topic },
      { contentType: newTopicObj },
      {
        numberOfFollowers: 1,
      },
      { 'contentType.$.engagements': engagementScores.follow }
    );

    // await User.findByIdAndUpdate(
    //   { _id: follower },
    //   {
    //     $inc: { numberOfFollowing: 1 },
    //   }
    // );
    // await User.findByIdAndUpdate(
    //   { _id: following },
    //   { $inc: { numberOfFollowers: 1 } }
    // );

    res.status(200).json({ status: 'success', follow: createFollow });
  } catch (err) {
    return next(new AppError(err, 403));
  }
});

exports.getFollowers = catchAsync(async (req, res, next) => {
  const findBy = { following: req.params.user_id || req.user._id };
  const populateBy = ['follower'];
  factory.findAll(Follow, {
    findBy,
    populateOptions: populateBy,
    populateData: populateFollowItems,
  })(req, res, next);
});

exports.getFollowings = catchAsync(async (req, res, next) => {
  const findBy = { follower: req.params.user_id || req.user._id };
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
  const follower = req.user._id;

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
