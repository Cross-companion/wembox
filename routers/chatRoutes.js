const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const contactController = require('../controllers/contact/contactController');
const chatController = require('../controllers/chat/chatController');

router.use(authController.protect);

router
  .route('/')
  .get(chatController.getRecentChats)
  .post(contactController.protect, chatController.sendChat)
  .delete(chatController.deleteChat);

//-- <> -- //
module.exports = router;
