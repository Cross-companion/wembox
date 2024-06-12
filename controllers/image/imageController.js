const ImageFile = require('../../utilities/imageFileManager');
const AppError = require('../../utilities/AppError');
const catchAsync = require('../../utilities/catchAsync');

const { AWS_IMAGE_NOT_FOUND } = process.env;

async function getNotFoundImg(imageManager) {
  const imgNum = Math.round(Math.random()) + 1;
  const notFoundImgUrl = AWS_IMAGE_NOT_FOUND.replace('<NUM>', imgNum);
  const ImageData = await imageManager.getFromAWS(notFoundImgUrl);
  return ImageData;
}

exports.getImage = catchAsync(async (req, res, next) => {
  let { folderName, imagePath } = req.params;
  if (!folderName || !imagePath) return next(new AppError('Invalid img path.'));
  const imageUrl = `${folderName}/${imagePath}`;
  const imageManager = new ImageFile();

  try {
    const { Body: image, ContentType } = await imageManager.getFromAWS(
      imageUrl
    );
    res.setHeader('Content-Type', ContentType);
    image.pipe(res);
  } catch (err) {
    const { Body: image, ContentType } = await getNotFoundImg(imageManager);
    res.status(404).setHeader('Content-Type', ContentType);
    image.pipe(res);
  }
});

exports.showNotFoundImage = catchAsync(async (req, res) => {
  const imageManager = new ImageFile();
  const { Body: image, ContentType } = await getNotFoundImg(imageManager);
  res.status(404).setHeader('Content-Type', ContentType);
  image.pipe(res);
});
