const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const contactController = require('../controllers/contact/contactController');
const chatController = require('../controllers/chat/chatController');

router.use(authController.protect);

router
  .route('/')
  .post(
    (req, res, next) => {
      console.log('herer >>>>');
      next();
    },
    chatController.uploadChatImages,
    contactController.protect,
    chatController.handleChatImages,
    chatController.sendChat
  )
  .delete(chatController.deleteChat);

router.route('/:otherUserID').get(chatController.getRecentChats);

//-- <> -- //
module.exports = router;
