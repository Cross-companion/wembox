const Reader = require('@maxmind/geoip2-node').Reader;
const request = require('request');
const { engagementTimeSpans } = require('../config/interestConfig');
const countryRegions = require('../config/countryRegions.json');
//
const catchAsync = require('./catchAsync');
//
exports.getFollowsFilterBy = (req, type = 'following') => {
  let userFollowsToGet = req.user?.id;
  // If the is an user_id parameter userFollowsToGet is the value of the parameter
  if (req.params.user_id) userFollowsToGet = req.params.user_id;
  if (req.user?.isAdmin && !req.params.user_id) userFollowsToGet = false;

  if (!userFollowsToGet) throw 'No user was specified';

  let filterBy;
  if (type === 'following') {
    filterBy = userFollowsToGet ? { following: userFollowsToGet } : {};
  } else {
    filterBy = userFollowsToGet ? { follower: userFollowsToGet } : {};
  }

  return filterBy;
};

const randomizeString = (str = '0123456789', outputLength = str.length) => {
  let randomStr = '';
  for (let i = 0; i < outputLength; i++) {
    const randomIndex = Math.floor(Math.random() * str.length);
    randomStr += str[randomIndex];
  }
  return randomStr;
};

exports.generateRandomToken = (tokenBY = '0123456789', tokenLenght = 6) => {
  const rearrangedStr = randomizeString(tokenBY);
  const token = randomizeString(rearrangedStr, tokenLenght);
  return token;
};

exports.getIPAddress = (request) => {
  let ip;
  try {
    ip =
      request?.headers['cf-connecting-ip'] ||
      request?.headers['x-real-ip'] ||
      request?.headers['x-forwarded-for'] ||
      request?.ip ||
      false;
  } catch (err) {
    ip = false;
  }

  const defaultLocalTestingIP = '::ffff:127.0.0.1';
  if (ip === defaultLocalTestingIP) ip = process.env.TEST_IP_ADDRESS;

  return ip;
};

exports.getLocationByIP = async (ip) => {
  let continent, country, city, region;
  try {
    await Reader.open('./geolite-db/GeoLite2-city.mmdb').then((reader) => {
      const response = reader.city(ip);
      continent = response.continent.names.en;
      country = response.country.names.en;
      city = response.city.names.en;
      region = countryRegions.find(
        (region) =>
          region.country.toLowerCase() ==
          response.country.names.en.toLowerCase()
      ).region;
    });
  } catch (err) {
    const stringForGlobal = 'global';
    continent = stringForGlobal;
    country = stringForGlobal;
    region = stringForGlobal;
    city = stringForGlobal;
  }
  return { continent, country, city, region };
};

const calculatePercentage = (part, whole) => {
  if (part > whole)
    throw new Error(
      'When calculating percentages, the `part` must be less than the `whole`'
    );
  const percentage = (part / whole) * 100;
  const reversePercentage = 100 - percentage;
  return { percentage, reversePercentage };
};

exports.getCountryWeight = (userInterest, timeSpan = 'monthly') => {
  if (!engagementTimeSpans.includes(timeSpan)) return 0;

  const { countryEngagements, globalEngagements } = userInterest.reduce(
    (accumulator, interest) => {
      if (interest.regions[0] === 'global' || !interest.regions[0])
        return accumulator;
      accumulator.globalEngagements += interest.engagements[timeSpan];
      accumulator.countryEngagements +=
        interest.regions[0].engagements[timeSpan];
      return accumulator;
    },
    { countryEngagements: 0, globalEngagements: 0 }
  );

  // Gets the percentage of a regions engagement inrelation to the global engagements on the specified topics.
  const countryPercentage = Math.ceil(
    calculatePercentage(countryEngagements, globalEngagements).percentage / 10
  );

  // Sets appriopriate countryWeights
  if (!countryPercentage) return false;
  if (countryPercentage <= 2) return countryPercentage + 2;
  if (countryPercentage <= 4) return 5;
  else return 6;
};
