const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const contactController = require('../controllers/contact/contactController');
const chatController = require('../controllers/chat/chatController');

router.use(authController.protect);
router.use(chatController.deliverChats);

router.route('/').get(contactController.getContacts);

router
  .route('/request')
  .get(contactController.getReceivedContactRequests)
  .post(contactController.sendContactRequest)
  .patch(contactController.processContactRequest);

//-- <> -- //
module.exports = router;
