const express = require('express');

const viewController = require('../controllers/view/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/reset-password/:token', viewController.showResetPassword);
router.get('/auth', viewController.showAuth);

router.use(authController.protect);

router.get('/', viewController.showApp);
router.get('/pick-interests', viewController.showInterestPage);

//-- <> -- //
module.exports = router;
