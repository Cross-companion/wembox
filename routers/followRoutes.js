const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const followController = require('../controllers/follow/followController');

router.use(authController.protect);

router
  .route('/')
  .post(followController.follow)
  .get(
    authController.restrictTo('admin', 'senior-admin'),
    followController.getAllFollows
  )
  .delete(followController.unfollow);
router.route('/unfollow').delete(followController.unfollow);
router.route('/followers/:user_id?').get(followController.getFollowers);
router.route('/followings/:user_id?').get(followController.getFollowings);

//-- <> -- //
module.exports = router;
