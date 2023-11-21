const User = require('../../models/user/userModel');
const catchAsync = require('../../utilities/catchAsync');
const AppError = require('../../utilities/AppError');

exports.sendContactRequest = catchAsync(async (req, res, next) => {
  const { username } = req.user;
  const recieverID = req.params?.recieverID;

  if (!recieverID)
    return next(new AppError('Invalid recieverID specified', 401));

  const reciever = await User.findById(recieverID);

  res.status(200).json({
    status: 'success',
    message: `${username}, your contact request to ${reciever.username} has been sent`,
  });
});
