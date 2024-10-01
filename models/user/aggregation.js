const mongoose = require('mongoose');

const { DEFAULT_LOCATION } = require('../../config/userConfig');
const { declinedStatus } = require('../../config/contactConfig');
const User = require('./userModel');

class UserAggregations {
  constructor(
    currentUser,
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
  ) {
    this.currentUser = new mongoose.Types.ObjectId(currentUser);
    this.topics = topics;
    this.city = userLocation?.city || 'global';
    this.country = userLocation?.country || 'global';
    this.continent = userLocation?.continent || 'global';
    this.geoAreaStrings = ['country', 'region', 'continent', DEFAULT_LOCATION];
    this.region = userLocation?.region || 'global';
    this.numberOfSuggestions = numberOfSuggestions;
    this.page = page;
    this.countryWeight = countryWeight;
    this.interestTypes = interestTypes;
    this.paginationKey = paginationKey;
    this.paginationData = paginationData || {};
    this.excludeByContacts = excludeByContacts === true;
    this.excludeByFollowing = excludeByFollowing === true;
    this.conditionToExcludeContacts = conditionToExcludeContacts === true;
    this.conditionToExcludeFollowing = conditionToExcludeFollowing === true;
    this.isActivatedPage = false;
    this.createdNewPaginationData = false;
    this.sortBy = {
      'contentTypeMatched.engagements': -1,
    };
    this.defaultProject = {
      profileImage: 1,
      accountType: 1,
      IPGeoLocation: 1,
      wems: 1,
      name: 1,
      frontEndUsername: 1,
      contentTypeMatched: 1,
      isFollowed: 1,
      isInContact: 1,
    };
    this.emptyAggregation = {
      $addFields: {},
    };
  }

  _geoAreaIsUseful(geoArea = 'country') {
    return this[geoArea] && this[geoArea] !== DEFAULT_LOCATION;
  }

  _createNewPaginationData(
    geoArea = 'country',
    pageActivated = this.page,
    usersReturnedAtActivation = 0
  ) {
    const newPaginationData = { pageActivated, usersReturnedAtActivation };
    this.paginationData[geoArea] = newPaginationData;

    this.isActivatedPage = true;

    this.createdNewPaginationData = true;
  }

  _updatePaginationData(geoArea, usersReturnedAtActivation) {
    this.paginationData[geoArea].usersReturnedAtActivation =
      usersReturnedAtActivation;
  }

  _contentTypeMatched(contentArr, typeOfContent) {
    return {
      contentTypeMatched: {
        $let: {
          vars: {
            maxEngagementContent: {
              $reduce: {
                input: '$contentType',
                initialValue: {
                  [typeOfContent]: null,
                  engagements: -1, // A value lower than any possible engagement value
                },
                in: {
                  $cond: {
                    if: {
                      $and: [
                        { $in: [`$$this.${typeOfContent}`, contentArr] },
                        {
                          $gt: ['$$this.engagements', '$$value.engagements'],
                        },
                      ],
                    },
                    then: '$$this',
                    else: '$$value',
                  },
                },
              },
            },
          },
          in: {
            $cond: {
              if: { $eq: [`$$maxEngagementContent.${typeOfContent}`, null] },
              then: '$$maxEngagementContent', // or provide a default value
              else: '$$maxEngagementContent',
            },
          },
        },
      },
    };
  }

  getIsFollowing() {
    return {
      from: 'follows', // The name of the follow collection
      let: {
        userId: this.currentUser,
        otherUser: '$_id',
      }, // Define variables for the current user's ID
      pipeline: [
        // Match documents where the follower ID matches the current user's ID
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$follower', '$$userId'] }, // Current user is the follower
                { $eq: ['$following', '$$otherUser'] }, // Document being aggregated is the following
              ],
            },
          },
        },
      ],
      as: 'isFollowing', // Output field to store the results of the join
    };
  }

  setIsFollowed() {
    return {
      isFollowed: {
        $cond: {
          if: { $gt: [{ $size: '$isFollowing' }, 0] },
          then: true,
          else: false,
        },
      },
    };
  }

  getIsInContact(currentUser = this.currentUser) {
    return {
      from: 'chats', // The name of the chats collection
      let: {
        userId: currentUser,
        otherUser: '$_id',
      }, // Define variables for the user IDs
      pipeline: [
        // Match documents where the sender ID matches the current user's ID or the otherUser
        {
          $match: {
            $expr: {
              $and: [
                { $in: ['$sender', ['$$userId', '$$otherUser']] },
                { $in: ['$receiver', ['$$userId', '$$otherUser']] },
                { $eq: ['$contactRequest.isContactRequest', true] },
                { $ne: ['$contactRequest.status', declinedStatus] },
              ],
            },
          },
        },
      ],
      as: 'isContacted', // Output field to store the results of the join
    };
  }

  setIsInContact() {
    return {
      isInContact: {
        $cond: {
          if: { $gt: [{ $size: '$isContacted' }, 0] },
          then: true,
          else: false,
        },
      },
    };
  }

  SUGGEST_CREATOR_BY_COUNTRY = () => {
    const skipBy =
      (this.page - 1) * (this.numberOfSuggestions - this.countryWeight);
    return [
      {
        $match: {
          _id: { $ne: this.currentUser },
          contentType: {
            $elemMatch: {
              topic: { $in: this.topics },
            },
          },
        },
      },
      {
        $addFields: this._contentTypeMatched(this.topics, 'topic'),
      },
      // All exclude fields logic occurs in two places in this code.
      {
        $lookup: this.getIsFollowing(),
      },
      {
        $addFields: this.setIsFollowed(),
      },
      this.excludeByFollowing
        ? {
            $match: {
              isFollowed: this.conditionToExcludeFollowing,
            },
          }
        : this.emptyAggregation,
      {
        $lookup: this.getIsInContact(),
      },
      {
        $addFields: this.setIsInContact(),
      },
      this.excludeByContacts
        ? {
            $match: {
              isInContact: this.conditionToExcludeContacts,
            },
          }
        : this.emptyAggregation,
      //
      {
        $sort: this.sortBy,
      },
      this._geoAreaIsUseful()
        ? {
            $facet: {
              differentCountry: [
                {
                  $match: {
                    'IPGeoLocation.country': { $ne: this.country },
                  },
                },
                {
                  $skip: skipBy,
                },
                {
                  $limit: this.numberOfSuggestions - this.countryWeight || 1,
                },
              ],
              sameCountry: [
                {
                  $match: {
                    'IPGeoLocation.country': this.country,
                  },
                },
                {
                  $skip: (this.page - 1) * this.countryWeight,
                },
                {
                  $limit: this.countryWeight || 1,
                },
              ],
            },
          }
        : this.emptyAggregation,
      this._geoAreaIsUseful()
        ? {
            $project: {
              users: {
                $concatArrays: ['$sameCountry', '$differentCountry'],
              },
            },
          }
        : this.emptyAggregation,
      this._geoAreaIsUseful()
        ? {
            $unwind: '$users',
          }
        : this.emptyAggregation,
      this._geoAreaIsUseful()
        ? {
            $replaceRoot: { newRoot: '$users' },
          }
        : this.emptyAggregation,
      this._geoAreaIsUseful()
        ? {
            $sort: this.sortBy,
          }
        : this.emptyAggregation,
      !this._geoAreaIsUseful()
        ? {
            $skip: skipBy,
          }
        : this.emptyAggregation,
      !this._geoAreaIsUseful()
        ? {
            $limit: this.numberOfSuggestions, // If the user's country is NOT useful.
          }
        : this.emptyAggregation,
      {
        $project: this.defaultProject,
      },
    ];
  };

  SUGGEST_CREATOR_BY_GENERAL_INTEREST(
    geoArea = 'country',
    paginationData = this.paginationData,
    options = {}
  ) {
    const { region, continent, global } = options;
    const { isActivatedPage, remainingUsers } = this;
    const { pageActivated, usersReturnedAtActivation } =
      paginationData[geoArea];
    const pagesToSkip = this.page - pageActivated;
    const pageForCalculating = isActivatedPage ? pagesToSkip : pagesToSkip - 1;
    const skipAlignment = isActivatedPage ? 0 : usersReturnedAtActivation;
    // For seeking users using any particular `geoArea`, after the first `isActivatedPage`, all the required `this.remainingUsers` from thence would have the same amount.
    const skipBy = pageForCalculating * this.remainingUsers + skipAlignment;

    return [
      {
        $match: {
          _id: { $ne: this.currentUser },
          contentType: {
            $not: {
              $elemMatch: {
                topic: { $in: this.topics },
              },
            },
            $elemMatch: { interest: { $in: this.interestTypes } },
          },
        },
      },
      this._geoAreaIsUseful(geoArea)
        ? {
            $match: {
              [`IPGeoLocation.${geoArea}`]: this[geoArea]
                ? this[geoArea]
                : { $exists: false },
            },
          }
        : this.emptyAggregation,
      region
        ? {
            $match: {
              [`IPGeoLocation.country`]: { $ne: this.country },
            },
          }
        : this.emptyAggregation,
      continent
        ? {
            $match: {
              [`IPGeoLocation.region`]: { $ne: this.region },
            },
          }
        : this.emptyAggregation,
      global
        ? {
            $match: {
              'IPGeoLocation.continent': { $ne: this.continent },
            },
          }
        : this.emptyAggregation,
      {
        $addFields: this._contentTypeMatched(this.interestTypes, 'interest'),
      },
      // All exclude fields logic occurs in two places in this code.
      {
        $lookup: this.getIsFollowing(),
      },
      {
        $addFields: this.setIsFollowed(),
      },
      this.excludeByFollowing
        ? {
            $match: {
              isFollowed: this.conditionToExcludeFollowing,
            },
          }
        : this.emptyAggregation,
      {
        $lookup: this.getIsInContact(),
      },
      {
        $addFields: this.setIsInContact(),
      },
      this.excludeByContacts
        ? {
            $match: {
              isInContact: this.conditionToExcludeContacts,
            },
          }
        : this.emptyAggregation,
      //
      {
        $sort: this.sortBy,
      },
      {
        $skip: skipBy,
      },
      {
        $limit: remainingUsers || 1,
      },
      {
        $project: this.defaultProject,
      },
    ];
  }

  async SUGGEST_CREATOR_AGG() {
    const users = await User.aggregate(this.SUGGEST_CREATOR_BY_COUNTRY());
    let enoughUsers = users.length >= this.numberOfSuggestions;

    if (enoughUsers)
      return {
        users,
        paginationData: this.createdNewPaginationData
          ? this.paginationData
          : undefined,
      };

    for (const geoArea of this.geoAreaStrings) {
      enoughUsers = users.length >= this.numberOfSuggestions;
      if (enoughUsers) break;

      this.remainingUsers = this.numberOfSuggestions - users.length;
      const conditionToCreateNewPaginationData =
        this.page <= this.paginationData[geoArea]?.pageActivated ||
        !this.paginationData[geoArea];

      if (conditionToCreateNewPaginationData)
        this._createNewPaginationData(geoArea, this.page);

      let similarUsersByArea = await User.aggregate(
        this.SUGGEST_CREATOR_BY_GENERAL_INTEREST(geoArea, this.paginationData, {
          [geoArea]: true,
        })
      );

      users.push(...similarUsersByArea);
      if (this.isActivatedPage)
        this._updatePaginationData(geoArea, similarUsersByArea.length);
    }

    return {
      users,
      newPaginationData: this.createdNewPaginationData
        ? this.paginationData
        : undefined,
    };
  }
}

module.exports = UserAggregations;

// --- Few  Improvements for this aggregation
// For performance, I should adapt to use only on aggregation call in the AGG_SUGGEST_CREATOR function.
//
//
//
