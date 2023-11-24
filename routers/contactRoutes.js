const express = require('express');
const router = express.Router();

const contactController = require('../controllers/contact/contactController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.route('/request').post(contactController.sendContactRequest);

//-- <> -- //
module.exports = router;
