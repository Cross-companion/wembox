const Follow = require('../models/followModel');
const User = require('../models/userModel');
const handlerFactory = require('./handlerFactory');
const AppError = require('../utilities/AppError');
const catchAsync = require('../utilities/catchAsync');
const helper = require('../utilities/helper');

exports.follow = catchAsync(async (req, res, next) => {
  // 1. create a new follow document with the appropriate parameters
  const follower = req.user.id;
  const { following } = req.body;
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

exports.getUserFollowers = catchAsync(async (req, res, next) => {
  const filterBy = helper.getFollowsFilterBy(req);
  handlerFactory.getAll(Follow, filterBy)(req, res, next);
});

exports.getUserFollowings = catchAsync(async (req, res, next) => {
  const filterBy = helper.getFollowsFilterBy(req, 'follower');
  handlerFactory.getAll(Follow, filterBy)(req, res, next);
});

exports.unfollow = catchAsync(async (req, res, next) => {
  const { following } = req.body;
  const follower = req.user.id;

  if (follower === following)
    return next(new AppError('You unable to unfollow your account.'));
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

//
// CREATE VOLUNTEERS
// setTimeout(async () => {
//   const dummy = {
//     number: 10,
//     name: 'volunteer',
//     frontEndUsername: 'Volunteer',
//     dateOfBirth: '2003-07-06',
//     password: '#1234567eR',
//     dummyEmailExtension: '@wm.com',
//   };
//   for (let i = 0; i < dummy.number; i++) {
//     const currentDummy = `${dummy.frontEndUsername}${i + 1}`;
//     const created = await User.create({
//       name: dummy.name,
//       frontEndUsername: currentDummy,
//       username: currentDummy,
//       email: currentDummy + dummy.dummyEmailExtension,
//       password: dummy.password,
//       passwordConfirm: dummy.password,
//       dateOfBirth: dummy.dateOfBirth,
//     });
//     console.log('created: ', created);
//   }
// }, 10000);

// DELETE ALL
// setTimeout(async () => {
//   const deleted = await User.deleteMany();
//   console.log('deleted', deleted);
// }, 10000);
