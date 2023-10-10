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
  }
}

module.exports = new UserConfig();
