const { DEFAULT_LOCATION } = require('../../config/userConfig');
const User = require('./userModel');

class UserAggregations {
  constructor(
    topics,
    userLocation,
    numberOfSuggestions,
    page,
    countryWeight,
    interestTypes,
    paginationKey,
    paginationData
  ) {
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

  SUGGEST_CREATOR_BY_COUNTRY = () => {
    return [
      {
        $match: {
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
      {
        $sort: this.sortBy,
      },
      !this._geoAreaIsUseful()
        ? this.emptyAggregation
        : {
            $facet: {
              differentCountry: [
                {
                  $match: {
                    'IPGeoLocation.country': { $ne: this.country },
                  },
                },
                {
                  $skip:
                    (this.page - 1) *
                    (this.numberOfSuggestions - this.countryWeight),
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
          },
      !this._geoAreaIsUseful()
        ? this.emptyAggregation
        : {
            $project: {
              users: {
                $concatArrays: ['$sameCountry', '$differentCountry'],
              },
            },
          },
      !this._geoAreaIsUseful()
        ? this.emptyAggregation
        : {
            $unwind: '$users',
          },
      !this._geoAreaIsUseful()
        ? this.emptyAggregation
        : {
            $replaceRoot: { newRoot: '$users' },
          },
      !this._geoAreaIsUseful()
        ? this.emptyAggregation
        : {
            $sort: this.sortBy,
          },
      this._geoAreaIsUseful()
        ? this.emptyAggregation
        : {
            $limit: this.numberOfSuggestions, // If the user's country is NOT useful.
          },
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
      !this._geoAreaIsUseful(geoArea)
        ? this.emptyAggregation
        : {
            $match: {
              [`IPGeoLocation.${geoArea}`]: this[geoArea]
                ? this[geoArea]
                : { $exists: false },
            },
          },
      !region
        ? this.emptyAggregation
        : {
            $match: {
              [`IPGeoLocation.country`]: { $ne: this.country },
            },
          },
      !continent
        ? this.emptyAggregation
        : {
            $match: {
              [`IPGeoLocation.region`]: { $ne: this.region },
            },
          },
      !global
        ? this.emptyAggregation
        : {
            $match: {
              'IPGeoLocation.continent': { $ne: this.continent },
            },
          },
      {
        $addFields: this._contentTypeMatched(this.interestTypes, 'interest'),
      },
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
