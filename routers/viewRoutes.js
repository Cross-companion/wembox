const express = require('express');

const viewController = require('../controllers/view/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.protect, viewController.showChats);
router.get('/reset-password/:token', viewController.showResetPassword);
// router.get('/me', authController.protect, viewController.getMe);

//-- <> -- //
module.exports = router;
