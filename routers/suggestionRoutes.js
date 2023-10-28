const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const suggestionController = require('../controllers/suggestionController');
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
  .get(
    suggestionController.getSuggestions,
    suggestionController.suggestCreator
  );

//-- <> -- //
module.exports = router;
