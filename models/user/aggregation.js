const { DEFAULT_LOCATION } = require('../../config/userConfig');

class UserAggregations {
  constructor() {
    this.emptyAggregation = {
      $addFields: {},
    };
  }

  _countryIsUseful(country) {
    return country && country !== DEFAULT_LOCATION;
  }

  AGG_SUGGEST_CREATOR = (
    topics,
    userCountry,
    numberOfSuggestions,
    countryWeight,
    page
  ) => {
    return [
      {
        $match: {
          contentType: {
            $elemMatch: {
              topic: { $in: topics },
            },
          },
        },
      },
      {
        $addFields: {
          contentTypeMatched: {
            $let: {
              vars: {
                maxEngagementContent: {
                  $reduce: {
                    input: '$contentType',
                    initialValue: {
                      topic: null,
                      engagements: -1, // A value lower than any possible engagement value
                    },
                    in: {
                      $cond: {
                        if: {
                          $and: [
                            { $in: ['$$this.topic', topics] },
                            {
                              $gt: [
                                '$$this.engagements',
                                '$$value.engagements',
                              ],
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
                  if: { $eq: ['$$maxEngagementContent.topic', null] },
                  then: '$$maxEngagementContent', // or provide a default value
                  else: '$$maxEngagementContent',
                },
              },
            },
          },
        },
      },
      {
        $sort: {
          'contentTypeMatched.engagements': -1,
        },
      },
      !this._countryIsUseful(userCountry)
        ? this.emptyAggregation
        : {
            $facet: {
              differentCountry: [
                {
                  $match: {
                    'IPGeoLocation.country': { $ne: userCountry },
                  },
                },
                {
                  $skip: (page - 1) * (numberOfSuggestions - countryWeight),
                },
                {
                  $limit: numberOfSuggestions - countryWeight || 1,
                },
              ],
              sameCountry: [
                {
                  $match: {
                    'IPGeoLocation.country': userCountry,
                  },
                },
                {
                  $skip: (page - 1) * countryWeight,
                },
                {
                  $limit: countryWeight || 1,
                },
              ],
            },
          },
      !this._countryIsUseful(userCountry)
        ? this.emptyAggregation
        : {
            $project: {
              users: {
                $concatArrays: ['$sameCountry', '$differentCountry'],
              },
            },
          },
      !this._countryIsUseful(userCountry)
        ? this.emptyAggregation
        : {
            $unwind: '$users',
          },
      !this._countryIsUseful(userCountry)
        ? this.emptyAggregation
        : {
            $replaceRoot: { newRoot: '$users' },
          },
      !this._countryIsUseful(userCountry)
        ? this.emptyAggregation
        : {
            $sort: {
              'contentTypeMatched.engagements': -1,
            },
          },
      this._countryIsUseful(userCountry)
        ? this.emptyAggregation
        : {
            $limit: numberOfSuggestions, // If the user's county is not useful, this.
          },
      {
        $project: {
          profileImg: 1,
          accountType: 1,
          'IPGeoLocation.country': 1,
          'IPGeoLocation.city': 1,
          wems: 1,
          name: 1,
          frontEndUsername: 1,
          contentTypeMatched: 1,
        },
      },
    ];
  };
}

module.exports = new UserAggregations();

// Few Issues and Improvements for this aggregation
//
//
//
//
