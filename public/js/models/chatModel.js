import Config from '../config.js';
import localStore from '../utils/localStore.js';

const { chatRoute, contactRoute } = Config;

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

  async sendChat(formData) {
    try {
      const data = await fetch(`${chatRoute}/`, {
        method: 'POST',
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => data);

      if (data.status !== 'success') throw new Error(data.message);

      console.log(data);
      return data;
    } catch (err) {
      console.error(err, 'BIG ONE');
    }
  }

  getNotification(userId) {
    return [...localStore.getItem('notifications')]?.find(
      (note) => note?._id === userId
    );
  }

  async processCR(requestData = { senderID, status }) {
    const data = await fetch(`${contactRoute}/request`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
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
