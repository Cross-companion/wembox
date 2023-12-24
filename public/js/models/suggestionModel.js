import Config from '../config.js';

const { suggestionRoute } = Config;

class suggestionModel {
  constructor() {}

  async suggestFollow(topic) {
    // const users = fetch(`${suggestionRoute}/creator`);
    const data = await fetch('../dev-data/suggestFollow.json').then((res) =>
      res.json()
    );

    if (data.status !== 'success') throw new Error(data.message);
    return data;
  }
}

export default new suggestionModel();
