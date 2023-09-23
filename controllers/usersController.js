const catchAsync = require('../utilities/catchAsync');

exports.follow = catchAsync(async (req, res, next) => {
  console.log('FOLLOWED ');
  res.status(200).json({ status: 'success' });
});
