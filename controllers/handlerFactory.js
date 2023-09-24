const AppError = require('../utilities/AppError');
const catchAsync = require('../utilities/catchAsync');

exports.getAll = (Model, filterBy = {}) =>
  catchAsync(async (req, res, next) => {
    const allData = await Model.find(filterBy);
    res.status(200).json({ allData });
  });

exports.deleteOne = () => {};
