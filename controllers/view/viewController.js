const catchAsync = require('../../utilities/catchAsync');
const { isNew } = require('./helpers');

exports.showResetPassword = catchAsync(async (req, res, next) => {
  return res.status(200).render('resetPassword', {
    title: 'Reset password',
  });
});

exports.showApp = catchAsync(async (req, res, next) => {
  return res.status(200).render('app/app', { user: req.user });
});

exports.showAuth = catchAsync(async (req, res, next) => {
  return res.status(200).render('auth', {
    title: 'Authentication',
  });
});

exports.showInterestPage = catchAsync(async (req, res, next) => {
  const { user } = req;
  if (!isNew(user.createdAt)) return res.redirect('/');

  return res.status(200).render('interestPage', {
    title: 'Interests',
  });
});
