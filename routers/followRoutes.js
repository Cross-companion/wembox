const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const followController = require('../controllers/follow/followController');
const chatController = require('../controllers/chat/chatController');

router.use(authController.protect);
router.use(chatController.deliverChats);

router
  .route('/')
  .post(followController.follow)
  .get(
    authController.restrictTo('admin', 'senior-admin'),
    followController.getAllFollows
  );
router.route('/unfollow').delete(followController.unfollow);
router.route('/followers/:user_id?').get(followController.getFollowers);
router.route('/followings/:user_id?').get(followController.getFollowings);

//-- <> -- //
module.exports = router;
