const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const usersController = require('../controllers/usersController');

router.route('/data-exists').get(authController.dataExists);
router.route('/captcha').post(authController.captcha);
router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/forgot-password').post(authController.forgotPassword);
router.route('/reset-password/:token').post(authController.resetPassword);
// KEEPING OLD CODE AWAY
// USE THIS FOR AS EXAMPLES

// router.route('/signup').post(authController.signup);
// router.route('/login').post(authController.login);
// router.route('/logout').get(authController.logout);
// router.route('/forgot-password').post(authController.forgotPassword);
// router.route('/reset-password/:token').patch(authController.resetPassword);

// // Protect all routes AFTER this middleware
// router.use(authController.protect);

// // USERS ROUTE
// router.route('/me').get(usersController.getMe, usersController.getOneUser);

// router
//   .route('/update-me')
//   .patch(
//     usersController.uploadUserPhoto,
//     usersController.resizeUserPhoto,
//     usersController.updateMe
//   );

// router.route('/delete-me').delete(usersController.deleteMe);

// router.route('/update-password').patch(authController.updatePassWord);

// // Restrict to admin all routes AFTER this middleware
// router.use(authController.restrictTo('admin'));

// router
//   .route('/')
//   .get(usersController.getAllUsers)
//   .post(usersController.createNewUser);

// router
//   .route('/:id')
//   .get(usersController.getOneUser)
//   .patch(usersController.updateUser)
//   .delete(usersController.deleteUser);

module.exports = router;
