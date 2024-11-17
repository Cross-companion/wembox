const Notification = require('../../models/notification/notificationModel');
const User = require('../../models/user/userModel');
const AppError = require('../../utilities/AppError');
const catchAsync = require('../../utilities/catchAsync');
const { setCachedUser } = require('../../utilities/helpers');

exports.getNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user?._id;
  if (!userId) return next(new AppError('User not found', 404));
  const notifications = await Notification.find({ for: userId })
    .populate('sender', 'name profileImage username')
    .populate('message', 'message status contactRequest.status createdAt');

  res.status(200).json({
    status: 'success',
    notifications,
  });
});

exports.subscribe = catchAsync(async (req, res, next) => {
  const user = req.user;
  const subscription = req.body;

  const subscribedUser = await User.findByIdAndUpdate(
    user._id,
    { subscription },
    { new: true, select: '+interests +contentType' }
  );
  setCachedUser(subscribedUser);

  res.status(201).json({ message: 'Subscription received.' });
});
