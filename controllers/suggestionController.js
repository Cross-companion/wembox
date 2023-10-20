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

  const users = await User.find({
    interests: { $elemMatch: { topic: topic } },
  });
  // console.log(Object.keys(users.interests.interests).includes(topic));
  res.status(200).json({
    status: 'success',
    results: users.length,
    users,
  });
  // const findBy = {
  //   $where: function () {
  //     // Use JavaScript code to check if the desiredValue is part of the keys
  //     const keys = Object.keys(this.contentType.topics);
  //     return keys.includes(topic);
  //   },
  // };
  // factory.findAll(User, findBy)(req, res, next);
});
