const express = require('express');
const router = express.Router();

const imageController = require('../controllers/image/imageController');

router.route('/:folderName/:imagePath').get(imageController.getImage);
router
  .route('/:folderName/:imagePath/*')
  .get(imageController.showNotFoundImage);
router.route('/*').get(imageController.showNotFoundImage);

//-- <> -- //
module.exports = router;
