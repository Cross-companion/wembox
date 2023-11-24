const express = require('express');
const router = express.Router();

const contactController = require('../controllers/contact/contactController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router
  .route('/request')
  .get(contactController.getreceivedContactRequests)
  .post(contactController.sendContactRequest)
  .patch(contactController.processContactRequest);

//-- <> -- //
module.exports = router;
