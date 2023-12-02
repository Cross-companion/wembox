const ImageFile = require('../../utilities/imageFileManager');
const AppError = require('../../utilities/AppError');
const catchAsync = require('../../utilities/catchAsync');

exports.getImage = catchAsync(async (req, res, next) => {
  let { folderName, imagePath } = req.params;
  if (!folderName || !imagePath) return next(new AppError('Invalid img path.'));
  const imageUrl = `${folderName}/${imagePath}`;
  const imageManager = new ImageFile();
  const { Body: image, ContentType } = await imageManager.getFromAWS(imageUrl);

  res.setHeader('Content-Type', ContentType);
  image.pipe(res);
});
