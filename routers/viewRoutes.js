const express = require('express');

const viewController = require('../controllers/view/viewController');
const authController = require('../controllers/authController');
const chatController = require('../controllers/chat/chatController');

const router = express.Router();

router.get('/reset-password/:token', viewController.showResetPassword);
router.get('/auth', viewController.showAuth);

router.use(authController.protect);
router.use(chatController.deliverChats);

router.get('/', viewController.showApp);
router.get('/pick-interests', viewController.showInterestPage);

//-- <> -- //
module.exports = router;
