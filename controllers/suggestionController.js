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

  req.suggestions = interests;
  next();
});

exports.suggestCreator = catchAsync(async (req, res, next) => {
  let topics = req.body.topics || '';
  const userCountry = req.user.IPGeoLocation.country;
  const numberOfSuggestions = +req.body.numberOfSuggestions || 5;
  let countryWeight = +req.body.countryWeight || 3;
  countryWeight =
    numberOfSuggestions > countryWeight ? countryWeight : numberOfSuggestions;
  const page = +req.body.page || 1;
  const maxSuggestions = 50;
  const minSuggestions = 2;

  if (
    numberOfSuggestions > maxSuggestions ||
    numberOfSuggestions < minSuggestions
  )
    return next(
      new AppError(
        `Number of suggestions should not be greater than ${maxSuggestions} or less than ${minSuggestions}`,
        403
      )
    );

  if (!Array.isArray(topics)) {
    topics = [topics]; // Convert to an array if it's not already
  }

  console.log(
    'Page:',
    page,
    'numberOfSuggestions:',
    numberOfSuggestions,
    'countryWeight:',
    countryWeight
  );
  console.log('Skips:', (page - 1) * (numberOfSuggestions - countryWeight));
  console.log('Country Skips:', (page - 1) * countryWeight);
  console.log('Normal Limit:', numberOfSuggestions - countryWeight || 1);
  console.log('Country Limit:', (page - 1) * countryWeight);

  const users = await User.aggregate([
    {
      $match: {
        contentType: {
          $elemMatch: {
            topic: { $in: topics },
          },
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
                cond: { $in: ['$$content.topic', topics] },
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
      $facet: {
        differentCountry: [
          {
            $match: {
              'IPGeoLocation.country': { $ne: userCountry },
            },
          },
          {
            $skip: (page - 1) * (numberOfSuggestions - countryWeight || 1),
          },
          {
            $limit: numberOfSuggestions - countryWeight || 1,
          },
        ],
        sameCountry: [
          {
            $match: {
              'IPGeoLocation.country': userCountry,
            },
          },
          {
            $skip: (page - 1) * countryWeight || 1,
          },
          {
            $limit: countryWeight || 1,
          },
        ],
      },
    },
    {
      $project: {
        users: {
          $concatArrays: ['$sameCountry', '$differentCountry'],
        },
      },
    },
    {
      $unwind: '$users',
    },
    {
      $replaceRoot: { newRoot: '$users' },
    },
    {
      $sort: {
        'contentTypeMatched.engagements': -1,
      },
    },
    {
      $project: {
        profileImg: 1,
        accountType: 1,
        'IPGeoLocation.country': 1,
        wems: 1,
        name: 1,
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
// To create a balance in the location of accounts that we suggest to a user, we would create a factor that watches the rate of user engagement on a topic in a particular geograpghical area and we can then use this factor to decide evenly on which creator to show a user

// WHAT TO DO NEXT: 22-10-23
// Add skips and limits to aggregation so that we can respond to a next button
// Prepare the aggregation to be able to handle an array of topics.
// Research on how I can possibly curb the value of the interest engagement to avoid it increasing to a BIG integer.
// Add total engagements to interest to be able to calculate the countryWeights dynamically.

// WHAT TO DO NEXT: 22-10-23
// The `contentTypeMatched` variable should be filtered and only select the highes engagements
