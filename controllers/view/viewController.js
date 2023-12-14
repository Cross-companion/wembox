const catchAsync = require('../../utilities/catchAsync');

exports.showResetPassword = catchAsync(async (req, res, next) => {
  return res.status(200).render('resetPassword', {
    title: 'Reset password',
  });
});

exports.showChats = catchAsync(async (req, res, next) => {
  return res.status(200).render('chats', {
    title: 'Reset password',
  });
});
