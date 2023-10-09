class UserConfig {
  constructor() {
    this.INTEREST_ENUM = [
      'music',
      'entertainment',
      'sports',
      'gaming',
      'fashion and beauty',
      'food',
      'business and finance',
      'arts and culture',
      'technology',
      'travel',
      'outdoors',
      'fitness',
      'careers',
      'animation and comics',
      'family and relationships',
      'science',
    ];
    this.INTEREST_TOPICS_ENUM = ['Worked'];
    this.SHADOW_INTEREST_ENUM = this.INTEREST_ENUM;
    this.SHADOW_INTEREST_TOPICS_ENUM = this.INTEREST_TOPICS_ENUM;
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
  }
}

module.exports = new UserConfig();
