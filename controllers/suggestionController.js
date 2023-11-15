const User = require('../models/user/userModel');
const Interest = require('../models/interest/interestModel');
const UserAggregations = require('../models/user/aggregation');
const { getCountryWeight } = require('../utilities/helpers');
const AppError = require('../utilities/AppError');
const catchAsync = require('../utilities/catchAsync');
const redis = require('../utilities/redisInit');
const { DEFAULT_LOCATION } = require('../config/userConfig');

/**
 * Since this user interest is cached, it looses all its document methods, any document method used after here must be defined in and called from the DocumentMethods class.
 */
exports.getSuggestions = catchAsync(async (req, res, next) => {
  const userRegion = req.user.IPGeoLocation.region;
  const interestKey = process.env.INTEREST_CACHE_KEY + req.user._id;
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
  const interestTypes = interests.map((el) => el.interest);
  console.log(interestTypes);
  const timeSpan = req.params.timeSpan || undefined;
  const userLocation = req.user.IPGeoLocation; // userRegion can be added later
  const numberOfSuggestions = +req.body.numberOfSuggestions || 10;
  const { numberOfReturnedRelatedCreators } = req.session;
  let countryWeight =
    +req.body.countryWeight ||
    getCountryWeight(interests, timeSpan, numberOfSuggestions);
  userLocation.country === DEFAULT_LOCATION ? (countryWeight = 0) : '';
  countryWeight =
    numberOfSuggestions > countryWeight ? countryWeight : numberOfSuggestions;
  const page = +req.body.page || 1;
  const maxSuggestions = 200;
  const minSuggestions = 2; // minsuggestions (!userCountry: 1, userCountry: 1)

  if (page < 1) return new AppError('Page number cannot be less than 1', 401);
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

  const USER_AGG = new UserAggregations(
    topics,
    userLocation,
    numberOfSuggestions,
    page,
    countryWeight,
    interestTypes,
    numberOfReturnedRelatedCreators
  );
  let users = await USER_AGG.SUGGEST_CREATOR_AGG();

  res.status(200).json({
    status: 'success',
    results: users.length,
    users,
  });
});
