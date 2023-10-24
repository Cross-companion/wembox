const User = require('../models/user/userModel');
const Interest = require('../models/interest/interestModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/AppError');
const redis = require('../utilities/redisInit');

exports.getSuggestions = catchAsync(async (req, res, next) => {
  const interestKey = process.env.INTEREST_CACHE_KEY + req.user.email;
  const cachedInterests = await redis
    .get(interestKey)
    .then((data) => JSON.parse(data));
  const interests = cachedInterests || (await Interest.find());
  if (!cachedInterests)
    await redis.set(
      interestKey,
      JSON.stringify(interests),
      'ex',
      process.env.REDIS_VERIFICATION_EXP
    );
  res.status(200).json({
    status: 'success',
    interests,
  });
});

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
// To create a balance in the location of accounts that we suggest to a user, we would create a factor that watches the rate of user engagement on a topic in a particular geograpghical area and we can then use this factor to decide evenly on which creator to show a user
// To detect if a creator selected that he wants to be creating a particular content type, We can create a new property of the `contentType` called `userSpecified` that would be a boolean.
//
//
