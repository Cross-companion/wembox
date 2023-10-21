const Interest = require('../models/interest/interestModel');

class UserConfig {
  constructor() {
    this.ACCOUNT_TYPES = [
      'user',
      'organization',
      'enterprise',
      'verified-user',
      'verified-organization',
      'verified-enterprise',
      'governmental',
      'admin',
      'senior-admin',
    ];
    this.ADMIN_TYPES = { normalAdmin: 'admin', seniorAdmin: 'senior-admin' };
    this.INTEREST_TYPES = [];
    this.DEFAULT_INTEREST_ARRAY = [];
    // process.env.NODE_ENV === 'development'
    //   ? this._testInitialise()
    // :
    this._initialise();
  }

  // INTEREST_TYPES: Array containing all the possible interest that a user can chose from.
  // DEFAULT_INTEREST_ARRAY: Array containing all the
  async _initialise() {
    const interestData = await this.setInterests();
    console.log('PROD INIT');
  }

  async setInterests() {
    try {
      const maxNumOfElem = 5;
      const interests = await Interest.find().select('-__v -themeColor -_id');

      const types = [];
      const defaultArray = interests
        .sort((a, b) => {
          const typeToAdd = a.interest.toString();
          !types.includes(typeToAdd) ? types.push(typeToAdd) : '';

          return b.chosenAtSignUp - a.chosenAtSignUp;
        })
        .splice(0, maxNumOfElem)
        .map((item) => {
          return {
            topic: item.topic,
            interest: item.interest,
            value: 0,
          };
        });

      this.INTEREST_TYPES = types;
      this.DEFAULT_INTEREST_ARRAY = defaultArray;
      return { types, defaultArray };
    } catch (err) {
      const errorMsg =
        'There was an error processing this function. This mostly because database connection failed. Try restarting the process.';
      console.log(errorMsg);
      process.exit(1);
    }
  }

  async _testInitialise() {
    this.INTEREST_TYPES = [
      'gaming',
      'fashion and beauty',
      'business and finance',
      'family and relationships',
      'music',
      'entertainment',
      'sports',
      'food',
      'arts and culture',
      'careers',
      'animation and comics',
      'science',
      'technology',
      'travel',
      'outdoors',
      'fitness',
    ];
    this.DEFAULT_INTEREST_ARRAY = [
      {
        topic: 'comic artists',
        interest: 'animation and comics',
        value: 0,
      },
      { topic: 'camping', interest: 'outdoors', value: 0 },
      { topic: 'astronomy', interest: 'science', value: 0 },
      { topic: 'movies', interest: 'entertainment', value: 0 },
      { topic: 'software', interest: 'technology', value: 0 },
    ];
    console.log('DEV INIT');
  }
}

module.exports = new UserConfig();
