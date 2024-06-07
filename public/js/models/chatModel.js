import Config from '../config.js';

const { chatRoute } = Config;

class ChatModel {
  async getChats(otherUserId) {
    const signal = this.setAbortController('getChats');

    const data = await fetch(`${chatRoute}/${otherUserId}`, {
      signal,
    })
      .then((res) => res.json())
      .then((data) => data);

    if (data.status !== 'success') throw new Error(data.message);

    return data;
  }

  setAbortController(name) {
    this[`${name}AbortController`]?.abort();
    this[`${name}AbortController`] = new AbortController();
    const signal = this[`${name}AbortController`].signal;
    return signal;
  }
}

export default new ChatModel();
