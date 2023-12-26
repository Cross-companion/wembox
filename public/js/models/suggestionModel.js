import Config from '../config.js';

const { suggestionRoute, followRoute } = Config;

class suggestionModel {
  constructor() {}

  async suggestFollow(topic) {
    const reqObject = {
      topics: [topic],
      page: 1,
      numberOfSuggestions: 10,
      // ,"countryWeight": 1
    };

    const data = await fetch(`${suggestionRoute}/creator/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reqObject),
    })
      .then((res) => res.json())
      .then((data) => data);

    if (data.status !== 'success') throw new Error(data.message);
    return data;
  }

  async follow(userID, { follow = true } = {}) {
    const reqObject = {
      following: userID,
    };

    const data = await fetch(`${followRoute}`, {
      method: follow ? 'POST' : 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reqObject),
    })
      .then((res) => res.json())
      .then((data) => data);

    if (data.status !== 'success') throw new Error(data.message);
    console.log(data);
    return data;
  }
}

export default new suggestionModel();
