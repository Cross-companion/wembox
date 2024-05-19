const Interest = require('../../models/interest/interestModel');
const UserAggregations = require('../../models/user/aggregation');
const AppError = require('../../utilities/AppError');
const catchAsync = require('../../utilities/catchAsync');
const redis = require('../../utilities/redisInit');
const { extractSuggestCreatorData } = require('./helper');
/**
 * Since this user interest is cached, it looses all its document methods, any document method used after here must be defined in and called from the DocumentMethods class.
 * The interestKey should be created using the userRegion.
 */
exports.getSuggestions = catchAsync(async (req, res, next) => {
  const userRegion = req.user.IPGeoLocation.region;
  const interestKey = process.env.INTEREST_CACHE_KEY + userRegion;
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
  const {
    timeSpan,
    userLocation,
    numberOfSuggestions,
    topics,
    interests,
    interestTypes,
    countryWeight,
    page,
    maxSuggestions,
    minSuggestions,
    paginationKey,
    paginationData,
    excludeByContacts,
    excludeByFollowing,
    conditionToExcludeContacts,
    conditionToExcludeFollowing,
  } = extractSuggestCreatorData(req);

  if (page < 1)
    return next(new AppError('Page number cannot be less than 1', 401));
  if (!topics) return next(new AppError('No topic was specified.', 401));
  if (interestTypes.length < 1)
    return next(
      new AppError('No Interest was found for the given topic(s)', 404)
    );
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
    req.user._id,
    topics,
    userLocation,
    numberOfSuggestions,
    page,
    countryWeight,
    interestTypes,
    paginationKey,
    paginationData,
    excludeByContacts,
    excludeByFollowing,
    conditionToExcludeContacts,
    conditionToExcludeFollowing
  );

  const { users, newPaginationData } = await USER_AGG.SUGGEST_CREATOR_AGG();

  if (newPaginationData) req.session[paginationKey] = newPaginationData;

  res.status(200).json({
    status: 'success',
    results: users.length,
    users,
  });
});
