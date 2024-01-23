import Config from '../config.js';

const { suggestionRoute, followRoute, contactRoute, userRoute } = Config;

class suggestionModel {
  constructor() {
    this.getCurrentUser();
  }

  async getCurrentUser() {
    const data = await fetch(`${userRoute}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => data);

    if (data.status !== 'success') throw new Error(data.message);

    return data;
  }

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

  async suggestContactRequest(topics, page = 1) {
    const reqObject = {
      page,
      numberOfSuggestions: 10,
      // ,"countryWeight": 1
    };

    if (topics) reqObject.topics = topics;

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

    if (data.status !== 'success') throw new Error(data.message);
    return data;
  }

  async sendContactRequest(
    receiverID,
    { message = undefined, isContactRequest = true, requestBasis = {} } = {}
  ) {
    const reqObject = {
      receiverID,
      message,
    };

    const data = await fetch(`${contactRoute}`, {
      method: isContactRequest ? 'POST' : 'DELETE',
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
