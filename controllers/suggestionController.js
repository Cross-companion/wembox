const User = require('../models/user/userModel');
const Interest = require('../models/interest/interestModel');
const factory = require('./handlerFactory');
const { AGG_SUGGEST_CREATOR } = require('../utilities/aggregations');
const AppError = require('../utilities/AppError');
const catchAsync = require('../utilities/catchAsync');
const redis = require('../utilities/redisInit');
const userConfig = require('../config/userConfig');

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

  if (!Array.isArray(topics)) {
    topics = [topics]; // Convert to an array if it's not already (For permitting single strings)
  }

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

  const users = await User.aggregate(
    AGG_SUGGEST_CREATOR(
      topics,
      userCountry,
      numberOfSuggestions,
      countryWeight,
      page
    )
  );

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
// Research on how I can possibly curb the value of the interest engagement to avoid it increasing to a BIG integer.
// Add total engagements to interest to be able to calculate the countryWeights dynamically.
