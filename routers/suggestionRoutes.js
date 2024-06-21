const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const suggestionController = require('../controllers/suggestion/suggestionController');
const interestController = require('../controllers/interest/interestController');

router.use(authController.protect);

router
  .route('/interests')
  .get(interestController.getAllInterests)
  .post(
    authController.restrictTo('senior-admin'),
    interestController.createInterests
  );

router
  .route('/creator/:timeSpan?')
  .post(
    suggestionController.getSuggestions,
    suggestionController.suggestCreator
  );

//-- <> -- //
module.exports = router;
