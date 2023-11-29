const Reader = require('@maxmind/geoip2-node').Reader;
const redis = require('./redisInit');

const { engagementTimeSpans } = require('../config/interestConfig');
const countryRegions = require('../config/countryRegions.json');
const { contactsPerRequest } = require('../config/contactConfig');

exports.getFollowsFilterBy = (req, type = 'following') => {
  let userFollowsToGet = req.user?._id;
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

exports.getCountryWeight = (
  userInterest,
  timeSpan = 'monthly',
  numberOfSuggestions
) => {
  const defaultCountryWeight = 3;
  if (!engagementTimeSpans.includes(timeSpan)) return defaultCountryWeight;

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
  let weight;
  if (!countryPercentage) return defaultCountryWeight;
  else if (countryPercentage <= 2) weight = countryPercentage + 2;
  else if (countryPercentage > 2 && countryPercentage <= 4) weight = 5;
  else weight = 6;

  return Math.ceil((weight / 10) * numberOfSuggestions);
};

exports.setCachedUser = async (user) => {
  if (!user?._id) throw new Error('user._id not specified.');
  const userKey = `${process.env.USER_CACHE_KEY}${user._id}`;
  const status = await redis.set(
    userKey,
    JSON.stringify(user),
    'ex',
    process.env.REDIS_USER_EXP
  );

  return status;
};

exports.updateContactSession = (
  req,
  { senderID, receiverID, lastMessage, isDeleted = false }
) => {
  const userIDArray = [senderID, receiverID];

  for (let i = 0; i < userIDArray.length; i++) {
    const userID = userIDArray[i];
    const contactSessionKey = `${process.env.USER_RECENT_50_CONTACTS_SESSION_KEY}${userID}`;
    const contactList = req.session[contactSessionKey];

    if (!contactList || contactList?.length < 1) return;

    // For Optimization, on Array.reduce can be used here instead.
    contactList.forEach((contact) => {
      const isContact =
        contact.users.includes(receiverID) && contact.users.includes(senderID);

      if (isContact && !isDeleted) contact.lastMessage = lastMessage;
      if (isContact && isDeleted) {
        // check if deleted message was last chat.
        const newLastMessageID = lastMessage._id;
        const currentLastMessageID = contact.lastMessage._id;
        const isCurrentLastMessage = newLastMessageID == currentLastMessageID;

        contact.lastMessage = isCurrentLastMessage
          ? lastMessage
          : contact.lastMessage;
      }
    });
    contactList?.splice(contactsPerRequest);
    contactList.sort(
      (a, b) => a.lastMessage.createdAt + a.lastMessage.createdAt
    );

    req.session[contactSessionKey] = contactList;
  }
};
