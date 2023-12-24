const Interest = require('../../models/interest/interestModel');

const factory = require('../handlerFactory');
const catchAsync = require('../../utilities/catchAsync');
const AppError = require('../../utilities/AppError');
const userConfig = require('../../config/userConfig');

exports.createInterests = catchAsync(async (req, res, next) => {
  const createData = [...req.body.data];
  if (!createData.length)
    return next(new AppError('No Document to be create was specified.', 400));

  const newInterests = await Interest.insertMany(createData);
  newInterests.forEach((item) => {
    const newType = item.interest.toString();
    const newObject = { topic: item.topic, interest: item.interest };
    userConfig.INTEREST_TYPES.push(newType);
    userConfig.DEFAULT_INTEREST_ARRAY.push(newObject);
  });

  res.status(200).json({
    status: 'success',
    messaage: 'User interests created successfully.',
  });
});

// exports.getAllInterests = factory.findAll(
//   Interest,
//   {
//     populateData: ['chosenAtSignUp interest -_id'],
//   },
//   {
//     paginate: false,
//   }
// );

exports.getAllInterests = catchAsync(async (req, res, next) => {
  const groupedInterests = await Interest.aggregate([
    {
      $group: {
        _id: '$interest',
        count: { $sum: 1 },
        topics: { $addToSet: '$topic' },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: groupedInterests.length,
    interests: groupedInterests,
  });
});

exports.deleteInterest = catchAsync(async (req, res, next) => {});
