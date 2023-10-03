const { query } = require('express');
const APIFeatures = require('../utilities/APIFeatures');
const AppError = require('../utilities/AppError');
const catchAsync = require('../utilities/catchAsync');

exports.findAll = (
  Model,
  findBy = {},
  populateOptions = [],
  populateData = []
) =>
  catchAsync(async (req, res, next) => {
    let query = Model.find(findBy);

    populateOptions.forEach(
      (field, i) => (query = query.populate(field, populateData[i]))
    );

    console.log(req, 'REQUEST /////');

    const Features = new APIFeatures(query, req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await Features.query;
    if (!doc) return new AppError('Document not found', 404);

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: doc,
    });
  });

console.log('got here!!!');
// const findOne = catchAsync(
//   async (
//     req,
//     res,
//     next,
//     queryOptions = { Model: undefined, findBy: {}, select: [] }
//   ) => {
//     const { Model, findBy, select } = queryOptions;
//     if (!Model) return next('Query Model not specified.', 500);

//     let query = Model.findOne(findBy);

//     if (typeof select !== 'string') {
//       select.forEach((selectOption) => (query = query.select(selectOption)));
//     }
//     if (typeof select === 'string') {
//       query = query.select(select);
//     }
//     const data = await query;

//     if (!data) {
//       return next(new AppError('Document not found', 404));
//     }
//     res.status(200).json({ status: 'success', data });
//   }
// );

// exports.deleteOne = catchAsync(
//   async (req, res, next, queryOptions = { Model: undefined, findBy: {} }) => {
//     const { Model, findBy } = queryOptions;
//     if (!Model) return next('Query Model not specified.', 500);

//     let query = Model.findOneAndDelete(findBy);
//     const data = await query;

//     if (!data) {
//       return next(
//         new AppError('Document not found. No document was deleted.', 404)
//       );
//     }

//     res.status(200).json({ status: 'success', data });
//   }
// );
