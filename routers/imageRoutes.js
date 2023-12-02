const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const imageController = require('../controllers/image/imageController');

router.route('/:folderName/:imagePath').get(imageController.getImage);
router.use(authController.protect);

//-- <> -- //
module.exports = router;
