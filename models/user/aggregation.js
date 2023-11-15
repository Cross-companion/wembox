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
    numberOfReturnedRelatedCreators
  ) {
    this.topics = topics;
    this.city = userLocation?.city || 'global';
    this.country = userLocation?.country || 'global';
    this.continent = userLocation?.continent || 'global';
    this.geoAreaStrings = ['country', 'region', 'continent'];
    this.region = userLocation?.region || 'global';
    this.numberOfSuggestions = numberOfSuggestions;
    this.page = page;
    this.countryWeight = countryWeight;
    this.interestTypes = interestTypes;
    this.skipsForRelatedCreators = numberOfReturnedRelatedCreators || {
      country: 0,
      region: 0,
      continent: 0,
      [DEFAULT_LOCATION]: 0,
    };
    this.sortBy = {
      'contentTypeMatched.engagements': -1,
    };
    this.defaultProject = {
      profileImg: 1,
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

  SUGGEST_CREATOR_BY_GENERAL_INTEREST(geoArea = 'country', Options = {}) {
    const findGlobal = Options.findGlobal === true || false;
    const aggregation = [
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
      !findGlobal
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
        $skip: (this.page - 1) * this.remainingUsers,
      },
      {
        $limit: this.remainingUsers || 1,
      },
      {
        $project: this.defaultProject,
      },
    ];

    return aggregation;
  }

  async SUGGEST_CREATOR_AGG() {
    const users = await User.aggregate(this.SUGGEST_CREATOR_BY_COUNTRY());

    for (const geoArea of this.geoAreaStrings) {
      const enoughUsers = users.length >= this.numberOfSuggestions;
      if (enoughUsers) break;
      this.remainingUsers = this.numberOfSuggestions - users.length;

      let similarUsersByArea = await User.aggregate(
        this.SUGGEST_CREATOR_BY_GENERAL_INTEREST(geoArea)
      );
      if (geoArea === 'continent') {
        similarUsersByArea = similarUsersByArea.filter(
          (user) => user.IPGeoLocation.region !== this.region
        );
      } else if (geoArea === 'region') {
        similarUsersByArea = similarUsersByArea.filter(
          (user) => user.IPGeoLocation.country !== this.country
        );
      }

      users.push(...similarUsersByArea);
      console.log(this.remainingUsers, `: Remaining users at ${geoArea}`);
      const foundUsers = similarUsersByArea.length;
      console.log(foundUsers, `: found users at ${geoArea}`);
      console.log(
        this.numberOfSuggestions - users.length,
        `: Remaining users after ${geoArea}`
      );
    }

    const enoughUsers = users.length >= this.numberOfSuggestions;
    if (!enoughUsers) {
      this.remainingUsers = this.numberOfSuggestions - users.length;
      let similarUsersGlobally = await User.aggregate(
        this.SUGGEST_CREATOR_BY_GENERAL_INTEREST(DEFAULT_LOCATION, {
          findGlobal: true,
        })
      );
      users.push(...similarUsersGlobally);
      console.log(
        this.remainingUsers,
        `: Remaining users at ${DEFAULT_LOCATION}`
      );
      const foundUsers = similarUsersGlobally.length;
      console.log(foundUsers, `: found users at ${DEFAULT_LOCATION}`);
      console.log(
        this.numberOfSuggestions - users.length,
        `: Remaining users after ${DEFAULT_LOCATION}`
      );
    }

    return users;
  }
}

module.exports = UserAggregations;

// Few Issues and Improvements for this aggregation
// AGG_SUGGEST_CREATOR
//
//
//
