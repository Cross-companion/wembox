const User = require('../models/user/userModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/AppError');

exports.suggestCreator = catchAsync(async (req, res, next) => {
  const topic = req.params?.topic;
  const users = factory.findAll(User);
  res.status(200).json({
    status: 'success',
    users,
  });
});
