const Reader = require('@maxmind/geoip2-node').Reader;
const User = require('../models/user/userModel');
const redis = require('./redisInit');

const { engagementTimeSpans } = require('../config/interestConfig');
const countryRegions = require('../config/countryRegions.json');

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

exports.getCachedUser = async (id) => {
  const userKey = `${process.env.USER_CACHE_KEY}${id}`;
  const cachedUser = JSON.parse(await redis.get(userKey));
  const user = cachedUser || (await User.findById(id));

  return { user, userWasCached: cachedUser ? true : false };
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
  { senderID, receiverID, updatedContact, lastMessage, otherUser }
) => {
  if (
    !(
      req ||
      senderID ||
      receiverID ||
      updatedContact ||
      lastMessage ||
      otherUser
    )
  )
    throw new Error('Invalid arguments at updateContactSession.');

  // manually set populated fields so it'll be available at session.
  const { _id, username } = otherUser;
  updatedContact.otherUser = [{ _id, username }];
  updatedContact.lastMessage = lastMessage;

  const receiverContactSessionKey = `${process.env.USER_RECENT_50_CONTACTS_SESSION_KEY}${receiverID}`;
  const senderContactSessionKey = `${process.env.USER_RECENT_50_CONTACTS_SESSION_KEY}${senderID}`;

  const receiverContactList = req.session[receiverContactSessionKey];
  const senderContactList = req.session[senderContactSessionKey];
  const contactListsArr = [receiverContactList, senderContactList];
  const [receiversIndex, sendersIndex] = [0, 1];

  [...contactListsArr].forEach((contactList, i) => {
    if (!Array.isArray(contactList)) contactList = [];

    // Remove duplicate contacts
    contactList = contactList.filter(
      (contact) =>
        !(
          contact.users.includes(receiverID) && contact.users.includes(senderID)
        )
    );

    // Sets the new value of the contact as the first element i.e [0] using unshift.
    contactList?.unshift(updatedContact);
    if (contactList?.length > process.env.CONTACTLIST_LIMIT) contactList?.pop();

    if (i === receiversIndex)
      req.session[receiverContactSessionKey] = contactList;

    if (i === sendersIndex) {
      const sendersSessionIsAlive = senderContactList?.length;
      if (!sendersSessionIsAlive) return;

      req.session[senderContactSessionKey] = contactList;
    }
  });
};
