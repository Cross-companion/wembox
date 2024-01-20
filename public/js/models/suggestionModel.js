import Config from '../config.js';

const { suggestionRoute, followRoute } = Config;

class suggestionModel {
  constructor() {}

  async suggestFollow(topic, page = 1) {
    const reqObject = {
      topics: [topic],
      page,
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

  async suggestContactRequest(topic, page = 1) {
    const reqObject = {
      topics: topic,
      page,
      numberOfSuggestions: 10,
      // ,"countryWeight": 1
    };

    // const data = await fetch(`/public/dev-data/suggestFollow.json`)
    //   .then((res) => res.json())
    //   .then((data) => data);
    const data = await fetch(`${suggestionRoute}/creator/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reqObject),
    })
      .then((res) => res.json())
      .then((data) => data);

    console.log(data);

    if (data.status !== 'success') throw new Error(data.message);
    return data;
  }

  async follow(userID, { follow = true, followBasis = {} } = {}) {
    const reqObject = {
      following: userID,
      followBasis,
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

    return data;
  }
}

export default new suggestionModel();
