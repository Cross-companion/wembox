const catchAsync = require('../../utilities/catchAsync');
const { populateManifest } = require('./helper');

exports.getAuthManifest = catchAsync(async (req, res, next) => {
  const manifest = populateManifest();
  res.json(manifest);
});

exports.getAppManifest = catchAsync(async (req, res, next) => {
  const manifest = populateManifest();
  res.json(manifest);
});
