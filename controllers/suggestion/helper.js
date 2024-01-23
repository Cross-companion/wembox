const { DEFAULT_LOCATION } = require('../../config/userConfig');
const { getCountryWeight } = require('../../utilities/helpers');

function extractTopics(baseArray = []) {
  const topics = baseArray.map((interest) => {
    return interest.topic;
  });
  return topics;
}

exports.extractSuggestCreatorData = (req) => {
  const timeSpan = req.params.timeSpan || undefined;
  const userLocation = req.user.IPGeoLocation; // userRegion can be added later
  const numberOfSuggestions = +req.body.numberOfSuggestions || 10;
  let topics =
    req.body.topics || extractTopics(req.user.interests) || undefined;
  if (typeof topics === 'string') topics = [topics]; // Topics is a string.

  const interests = req.userInterests.filter((interest) =>
    topics.includes(interest.topic)
  );
  const interestTypes = interests.map((el) => el.interest);

  let countryWeight =
    +req.body.countryWeight ||
    getCountryWeight(interests, timeSpan, numberOfSuggestions);
  userLocation.country === DEFAULT_LOCATION ? (countryWeight = 0) : '';
  countryWeight =
    numberOfSuggestions > countryWeight ? countryWeight : numberOfSuggestions;

  const page = +req.body.page || 1;
  const maxSuggestions = 50;
  const minSuggestions = 2; // minsuggestions (!userCountry: 1, userCountry: 1)
  console.log(interestTypes);

  const paginationKey = `${process.env.CREATOR_AGG_PAGINATION_SESSION_KEY}${
    req.user.username
  }:${interestTypes.sort().join('-').replace(/ /g, '-')}`;

  const paginationData = req.session[paginationKey] || undefined;

  return {
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
  };
};
