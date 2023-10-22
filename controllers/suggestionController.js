const User = require('../models/user/userModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/AppError');

exports.suggestCreator = catchAsync(async (req, res, next) => {
  const topic = req.body.topic || '';

  const users = await User.aggregate([
    {
      $match: {
        contentType: {
          $elemMatch: { topic: topic },
        },
      },
    },
    {
      $addFields: {
        contentTypeMatched: {
          $arrayElemAt: [
            {
              $filter: {
                input: '$contentType',
                as: 'content',
                cond: { $eq: ['$$content.topic', topic] },
              },
            },
            0,
          ],
        },
      },
    },
    {
      $sort: {
        'contentTypeMatched.engagements': -1,
      },
    },
    {
      $project: {
        // profileImg: 1,
        // accountType: 1,
        // wems: 1,
        // name: 1,
        frontEndUsername: 1,
        contentTypeMatched: 1,
      },
    },
  ]);

  console.log('Country:', req.user.IPGeoLocation.country);

  res.status(200).json({
    status: 'success',
    results: users.length,
    users,
  });
});

// WHAT TO DO NEXT: 22-10-23
// Instead of finding documents by their contentType and location, I would find them by their contentType and a factor of the user engagement rate (Either by the percentage of users that engage with their wems when viewed (by 100%) or by the rate of user engagements by a monthly rate (using dates) is yet to be decided).
// Switch to an Aggregation for better access to documents.
// To create a balance in the location of accounts that we suggest to a user, we would create a factor that watches the rate of user engagement on a topic in a particular area and we can then use this factor to decide evenly on which creator to show a user
// To detect if a creator selected that he wants to be creating a particula content type, We can create a new property of the `contentType` called `userSpecified` that would be a boolean.
//
//
