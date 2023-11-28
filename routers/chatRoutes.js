const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const contactController = require('../controllers/contact/contactController');
const chatController = require('../controllers/chat/chatController');

router.use(authController.protect);

router.route('/').get(chatController.viewReceivedChats);

router.use(contactController.protect);

router.route('/').post(chatController.sendChat);

//-- <> -- //
module.exports = router;
