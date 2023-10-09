const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const interestController = require('../controllers/userInterest/interestController');

router.use(authController.protect);

router
  .route('/create_interests')
  .get(
    authController.restrictTo('senior-admin'),
    interestController.createInterests
  );
router
  .route('/create_interest_topics')
  .get(
    authController.restrictTo('senior-admin'),
    interestController.createInterestTopics
  );
router.route('/get_interests').get(interestController.getAllInterests);
router
  .route('/get_interest_topics')
  .get(interestController.getAllInterestTopics);

//-- <> -- //
module.exports = router;
