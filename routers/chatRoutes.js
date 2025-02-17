const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const contactController = require('../controllers/contact/contactController');
const chatController = require('../controllers/chat/chatController');

router.use(authController.protect);

router
  .route('/')
  .post(
    chatController.uploadChatImages,
    contactController.protect,
    chatController.handleChatImages,
    chatController.sendChat
  )
  .delete(chatController.deleteChat);

router.route('/:otherUserID').get(chatController.getRecentChats);
router.route('/seen/:otherUserId').get(chatController.seenRecentChats);
router
  .route('/update/:otherUserId/:status')
  .get(chatController.updateRecentStatus);

//-- <> -- //
module.exports = router;
