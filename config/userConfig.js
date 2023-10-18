const factory = require('../controllers/handlerFactory');
const Interest = require('../models/userInterestModel/interestModel');
const InterestTopics = require('../models/userInterestModel/interestTopicModel');

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
    this.INTEREST_TOPIC_TYPES = [];
    process.env.NODE_ENV === 'development'
      ? this._testInitialise()
      : this._initialise();
  }

  async _initialise() {
    this.INTEREST_TYPES =
      (await this._getInterests(Interest)) || this.INTEREST_TYPES;
    this.INTEREST_TOPIC_TYPES =
      (await this._getInterests(InterestTopics)) || this.INTEREST_TOPIC_TYPES;
    this.DEFAULT_INTEREST_OBJECT = this._setDefaultInterestObject(
      this.INTEREST_TYPES
    );
    this.DEFAULT_INTEREST_TOPIC_OBJECT = this._setDefaultInterestObject(
      this.INTEREST_TOPIC_TYPES
    );
  }

  _setDefaultInterestObject(TYPE) {
    const objectToSet = {};
    TYPE.forEach((item) => (objectToSet[item.toString()] = 0));
    return objectToSet;
  }

  async _getInterests(Model) {
    try {
      const interests = await Model.find().select('name -_id');
      const interestNames = interests.map((item) => item.name);
      return interestNames;
    } catch (err) {
      return false;
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
    this.INTEREST_TOPIC_TYPES = [
      'movies',
      'recipes',
      'cultural experiences',
      'family activities',
      'game reviews',
      'beauty products',
      'fashion trends',
      'adventure travel',
      'scientific discoveries',
      'education',
      'research breakthroughs',
      'music production',
      'backpacking',
      'basketball',
      'culinary techniques',
      'cultural heritage',
      'music reviews',
      'gadgets',
      'animation studios',
      'tennis',
      'fitness nutrition',
      'stock market',
      'parenting tips',
      'video games',
      'food reviews',
      'baseball',
      'literature',
      'football (soccer)',
      'wildlife',
      'restaurant reviews',
      'cultural events',
      'travel adventures',
      'comic books',
      'visual arts',
      'destinations',
      'professional growth',
      'virtual reality',
      'personal finance',
      'environment',
      'rugby',
      'cryptocurrency',
      'american football',
      'performing arts',
      'startups',
      'music festivals',
      'esports',
      'family health',
      'relationship advice',
      'comic artists',
      'camping',
      'software',
      'freelancing',
      'workplace tips',
      'tech news',
      'food trends',
      'award shows',
      'theater',
      'outdoor gear',
      'cooking',
      'golf',
      'gaming communities',
      'cricket',
      'entrepreneurship',
      'job search',
      'job interviews',
      'comic conventions',
      'business trends',
      'animation techniques',
      'workouts',
      'travel tips',
      'history',
      'psychology',
      'fitness challenges',
      'makeup',
      'mathematics',
      'fashion shows',
      'gaming news',
      'animation films',
      'exercise routines',
      'outdoor activities',
      'astronomy',
      'fitness trends',
      'gaming consoles',
      'fitness equipment',
      'parenting',
      'artificial intelligence',
      'nature exploration',
      'hiking',
      'beauty tips',
      'marriage',
      'formula 1',
      'smartphones',
      'music artists',
      'tv shows',
      'career development',
      'art history',
      'celebrities',
      'music history',
      'fashion designers',
      'music genres',
    ];
    this.DEFAULT_INTEREST_OBJECT = this._setDefaultInterestObject(
      this.INTEREST_TYPES
    );
    this.DEFAULT_INTEREST_TOPIC_OBJECT = this._setDefaultInterestObject(
      this.INTEREST_TOPIC_TYPES
    );
  }
}

module.exports = new UserConfig();
