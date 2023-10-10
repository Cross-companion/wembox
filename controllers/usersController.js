const Follow = require('../models/followModel');
const User = require('../models/userModel');
const factory = require('./handlerFactory');
const AppError = require('../utilities/AppError');
const catchAsync = require('../utilities/catchAsync');
const helper = require('../utilities/helper');

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

//
// CREATE VOLUNTEERS
// setTimeout(async () => {
//   const dummy = {
//     number: 14,
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

// CREATE FOLLOWS
// setTimeout(async () => {
//   const allUsers = await User.find();
//   const following = allUsers[0].id;
//   const promises = allUsers.slice(1).map(async (user) => {
//     const follower = user._id;
//     const createFollow = await Follow.create({ follower, following });
//     await User.findByIdAndUpdate(
//       { _id: follower },
//       { $inc: { numberOfFollowing: 1 } }
//     );
//     await User.findByIdAndUpdate(
//       { _id: following },
//       { $inc: { numberOfFollowers: 1 } }
//     );
//   });

//   await Promise.all(promises);
// }, 10000);

// DELETE ALL FOLLOWS
// setTimeout(async () => {
//   const deleted = await Follow.deleteMany();
//   console.log('deleted', deleted);
// }, 10000);

// // DELETE ALL USERS
// setTimeout(async () => {
//   const deleted = await User.deleteMany();
//   console.log('deleted', deleted);
// }, 10000);
