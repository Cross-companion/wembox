const Interest = require('../../models/interest/interestModel');
const InterestTopic = require('../../models/interest/interestTopicModel');

const factory = require('../handlerFactory');
const catchAsync = require('../../utilities/catchAsync');
const AppError = require('../../utilities/AppError');

exports.getFollowers = catchAsync(async (req, res, next) => {
  const findBy = { following: req.params.user_id || req.user.id };
  const populateBy = ['follower'];
  factory.findAll(
    Follow,
    findBy,
    populateBy,
    populateFollowItems
  )(req, res, next);
});

exports.createInterests = factory.createMany(Interest);
exports.getAllInterests = factory.findAll(
  Interest,
  {
    populateOptions: ['interestTopics'],
    populateData: ['chosenAtSignUp name -_id -interest'],
  },
  {
    paginate: false,
  }
);
exports.deleteInterest = catchAsync(async (req, res, next) => {});
exports.createInterestTopics = factory.createMany(InterestTopic);
exports.getAllInterestTopics = factory.findAll(InterestTopic, undefined, {
  paginate: false,
});
exports.getOneInterestTopic = catchAsync(async (req, res, next) => {});
exports.deleteInterestTopic = catchAsync(async (req, res, next) => {});
