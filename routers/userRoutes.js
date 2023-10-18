const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const usersController = require('../controllers/usersController');

router.route('/data-exists').get(authController.dataExists);

router
  .route('/captcha')
  .post(authController.captcha, authController.sendEmailOtp);

// -- <> -- REMOVE COMMENT WHEN ITS TIME FOR PRODUCTION
// router
//   .route('/signup')
//   .post(authController.verifyEmailOtp, authController.signup);

router.route('/signup').post(authController.signup);

router.route('/login').post(authController.login);
router.route('/forgot_password').post(authController.forgotPassword);
router.route('/reset_password/:token').post(authController.resetPassword);

router.use(authController.protect);
router.route('/logout').get(authController.logout); // the logout route is protected
router
  .route('/')
  .get(
    authController.restrictTo('admin', 'senior-admin'),
    usersController.getAllUsers
  );
router
  .route('/follow')
  .post(usersController.follow)
  .get(
    authController.restrictTo('admin', 'senior-admin'),
    usersController.getAllFollows
  );
router.route('/unfollow').delete(usersController.unfollow);
router.route('/followers/:user_id?').get(usersController.getFollowers);
router.route('/followings/:user_id?').get(usersController.getFollowings);

//-- <> -- //
module.exports = router;
