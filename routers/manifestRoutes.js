const express = require('express');
const router = express.Router();

const manifestController = require('../controllers/manifest/manifestController');
const authController = require('../controllers/authController');

router.get('/auth.webmanifest', manifestController.getAuthManifest);

router.use(authController.protect);

router.get('/app.webmanifest', manifestController.getAppManifest);

//-- <> -- //
module.exports = router;
