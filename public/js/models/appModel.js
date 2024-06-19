import Config from '../config.js';
import localStore from '../utils/localStore.js';

const { contactRoute, notificationRoute } = Config;
class AppModel {
  async getContacts() {
    if (this.contacts) return this;

    // const data = await fetch(`/public/dev-data/contacts.json`)
    const data = await fetch(`${contactRoute}/`)
      .then((res) => res.json())
      .then((data) => data);

    if (data.status !== 'success') throw new Error(data.message);

    localStore.setItem('contacts', data.contacts);
    this.contacts = data.contacts;
    return data;
  }

  async getNotifications() {
    if (this.notifications) return this;

    const data = await fetch(`${notificationRoute}/`)
      .then((res) => res.json())
      .then((data) => data);

    if (data.status !== 'success') throw new Error(data.message);

    localStore.setItem('notifications', data.notifications);
    this.notifications = data.notifications;
    return data;
  }
}

export default new AppModel();
