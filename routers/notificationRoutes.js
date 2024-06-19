const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const notificationController = require('../controllers/notification/notificationController');

router
  .route('/')
  .get(authController.protect, notificationController.getNotifications);

//-- <> -- //
module.exports = router;
