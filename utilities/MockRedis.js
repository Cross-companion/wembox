class MockRedis {
  dictionary = {};

  get(key) {
    return this.dictionary[key];
  }

  set(key, value, ex, exTime) {
    this.dictionary[key] = value;
    if (ex && exTime) this.expireItem(key, exTime);
  }

  del(key) {
    delete this.dictionary[key];
  }

  expireItem(key, exTime) {
    setTimeout(() => this.del(key), exTime * 1000);
  }
}

module.exports = new MockRedis();
