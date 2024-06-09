const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const contactController = require('../controllers/contact/contactController');
const chatController = require('../controllers/chat/chatController');

router.use(authController.protect);
router.use(chatController.deliverChats);

router
  .route('/')
  .post(
    chatController.uploadChatImages,
    contactController.protect,
    chatController.sendChat
  )
  .delete(chatController.deleteChat);

router.route('/:otherUserID').get(chatController.getRecentChats);

//-- <> -- //
module.exports = router;
