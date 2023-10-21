const User = require('../models/user/userModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/AppError');

exports.suggestCreator = catchAsync(async (req, res, next) => {
  const topic = req.body.topic || '';

  // const stats = await User.aggregate([
  //   {
  //     $match: { numberOfFollowers: { $gte: 1 } },
  //   },
  // ]);

  console.log(req.user.IPGeoLocation.country, ' :Country!');
  const users = await User.find({
    contentType: { $elemMatch: { topic: topic } },
    'IPGeoLocation.country': req.user.IPGeoLocation.country,
  })
    .sort('-numberOfFollowers')
    .select(
      'profileImg accountType wems numberOfFollowers IPGeoLocation name frontEndUsername frontEndUsername'
    );

  res.status(200).json({
    status: 'success',
    results: users.length,
    users,
  });
  // factory.findAll(User, findBy)(req, res, next);
});
