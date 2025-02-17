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
    const data = await fetch(`${chatRoute}/`, {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => data);

    if (data.status !== 'success') throw new Error(data.message);

    return data;
  }

  async updateToSeen(otherUserId) {
    const data = await fetch(`${chatRoute}/seen/${otherUserId}`)
      .then((res) => res.json())
      .then((data) => data);

    if (data.status !== 'success') throw new Error(data.message);

    return data;
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

  updateLocalUnseens(contactId) {
    const NumOFUnseensAfterOpenChat = 0;
    localStore.findAndUpdateElement('contacts', {
      key: '_id',
      value: contactId,
      update: {
        unseenMessages: NumOFUnseensAfterOpenChat,
      },
    });
  }

  setAbortController(name) {
    this[`${name}AbortController`]?.abort();
    this[`${name}AbortController`] = new AbortController();
    const signal = this[`${name}AbortController`].signal;
    return signal;
  }
}

export default new ChatModel();
