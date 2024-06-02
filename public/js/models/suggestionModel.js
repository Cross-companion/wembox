import Config from '../config.js';

const { suggestionRoute, followRoute, contactRoute, userRoute } = Config;

class suggestionModel {
  constructor() {}

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

  async getUser(username) {
    if (!this.getUserController) this.setAbortController('getUser');
    this.getUserController.abort();
    // Create a new controller for the current request
    this.getUserController = new AbortController();
    this.signal = this.getUserController.signal;

    const data = await fetch(`${userRoute}/user/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: this.signal,
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
      excludeByFollowing: true,
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
      excludeByContacts: true,
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

  async sendContactRequest(receiverID, { message = undefined } = {}) {
    const reqObject = {
      receiverID,
      message,
    };

    const data = await fetch(`${contactRoute}/request`, {
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

  setAbortController(name) {
    this[`${name}Controller`] = new AbortController();
    this[`${name}Signal`] = this[`${name}Controller`].signal;
  }
}

export default new suggestionModel();
