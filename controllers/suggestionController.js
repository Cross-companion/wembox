const User = require('../models/user/userModel');
const Interest = require('../models/interest/interestModel');
const { AGG_SUGGEST_CREATOR } = require('../models/user/aggregation');
const { getCountryWeight } = require('../utilities/helpers');
const AppError = require('../utilities/AppError');
const catchAsync = require('../utilities/catchAsync');
const redis = require('../utilities/redisInit');

exports.getSuggestions = catchAsync(async (req, res, next) => {
  const userRegion = req.user.IPGeoLocation.region;
  const interestKey = process.env.INTEREST_CACHE_KEY + req.user.email;
  const cachedInterests = await redis
    .get(interestKey)
    .then((data) => JSON.parse(data));

  const interests =
    cachedInterests ||
    (await Interest.find().select('topic interest regions engagements'));

  if (!cachedInterests) {
    // Remove all other regions on an interest except the users region. To reduce the size of the regions array before it's cached.
    interests.forEach((interest) => {
      interest.regions = interest.regions.find(
        (region) => region.region === userRegion
      ) || ['global']; // ['global'] if the userRegion is not an actual region
    });

    await redis.set(
      interestKey,
      JSON.stringify(interests),
      'ex',
      process.env.REDIS_INTEREST_EXP
    );
  }

  req.userInterests = interests;
  next();
});

exports.suggestCreator = catchAsync(async (req, res, next) => {
  let topics = req.body.topics || '';
  if (typeof topics === 'string') topics = [topics]; // Topics is a string.
  const interests = req.userInterests.filter((interest) =>
    topics.includes(interest.topic)
  );
  const timeSpan = req.params.timeSpan || undefined;
  const userCountry = req.user.IPGeoLocation.country; // userRegion can be added later
  const numberOfSuggestions = +req.body.numberOfSuggestions || 10;
  let countryWeight =
    +req.body.countryWeight || getCountryWeight(interests, timeSpan) || 3;
  countryWeight =
    numberOfSuggestions > countryWeight ? countryWeight : numberOfSuggestions;
  const page = +req.body.page || 1;
  const maxSuggestions = 50;
  const minSuggestions = 2; // minsuggestions (!userCountry: 1, userCountry: 1)

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

  res.status(200).json({
    status: 'success',
    results: users.length,
    users,
  });
});
