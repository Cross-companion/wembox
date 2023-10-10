const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const interestController = require('../controllers/userInterest/interestController');

router.use(authController.protect);

router
  .route('/interests')
  .get(interestController.getAllInterests)
  .post(
    authController.restrictTo('senior-admin'),
    interestController.createInterests
  );

router
  .route('/interests/topics')
  .get(interestController.getAllInterestTopics)
  .post(
    authController.restrictTo('senior-admin'),
    interestController.createInterestTopics
  );

//-- <> -- //
module.exports = router;
