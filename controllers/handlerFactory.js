const APIFeatures = require('../utilities/APIFeatures');
const AppError = require('../utilities/AppError');
const catchAsync = require('../utilities/catchAsync');

exports.createMany = (Model) =>
  catchAsync(async (req, res, next) => {
    const createData = [...req.body.data];
    if (!Model) return next(new AppError('Query Model not specified.', 500));
    if (!createData.length)
      return next(new AppError('No Document to be create was specified.', 500));

    await Model.insertMany(createData);

    res
      .status(200)
      .json({ status: 'success', messaage: 'Documents created successfully.' });
  });

exports.findAll = (
  Model,
  { findBy = {}, populateOptions = [], populateData = [] } = {},
  APIOptions = {}
) =>
  catchAsync(async (req, res, next) => {
    let query = Model.find(findBy);

    populateOptions.forEach(
      (field, i) => (query = query.populate(field, populateData[i]))
    );

    let Features = new APIFeatures(query, req.query);
    if (APIOptions.filter !== false) Features.filter();
    if (APIOptions.sort !== false) Features.sort();
    if (APIOptions.limitFields !== false) Features.limitFields();
    if (APIOptions.paginate !== false) Features.paginate();

    const doc = await Features.query;
    if (!doc) return next(new AppError('Document not found', 404));

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: doc,
    });
  });

exports.findOne = (
  Model,
  { findBy = {}, select = [], returnDoc = false } = {}
) =>
  catchAsync(async (req, res, next) => {
    if (!Model) return next(new AppError('Query Model not specified.', 500));

    let query = Model.findOne(findBy);

    if (typeof select !== 'string') {
      select.forEach((selectOption) => (query = query.select(selectOption)));
    }
    if (typeof select === 'string') {
      query = query.select(select);
    }
    const data = await query;

    if (!data) {
      return next(new AppError('Document not found', 404));
    }

    if (returnDoc === true) return data;
    res.status(200).json({ status: 'success', data });
  });

exports.deleteOne = (Model, { findBy = {} } = {}) =>
  catchAsync(async (req, res, next) => {
    if (!Model) return next(new AppError('Query Model not specified.', 500));

    let query = Model.findOneAndDelete(findBy);
    const data = await query;

    if (!data) {
      return next(
        new AppError('Document not found. No document was deleted.', 404)
      );
    }

    res.status(200).json({ status: 'success', data });
  });

exports.updateEngagements = async (
  Model,
  userID,
  additionalID = {},
  pushObject,
  increments = {},
  optionalIncrement,
  optionalUpdates = {}
) => {
  const { nModified } = await Model.updateOne(
    { _id: userID, ...additionalID },
    {
      $inc: { ...optionalIncrement, ...increments },
      ...optionalUpdates,
    }
  );

  console.log('nModified', nModified);
  if (nModified) return;

  await Model.updateOne(
    { _id: userID },
    { $push: pushObject, $inc: { ...increments } }
  );
};
