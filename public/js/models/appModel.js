import Config from '../config.js';
import localStore from '../utils/localStore.js';

const { contactRoute, notificationRoute } = Config;
class AppModel {
  async getContacts() {
    const locallyStoredContacts = localStore.getItem('contacts');
    if (this.contacts?.length) return { contacts: locallyStoredContacts };

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
    const locallyStoredNotifications = localStore.getItem('notifications');
    if (this.notifications?.length)
      return { notifications: locallyStoredNotifications };

    const data = await fetch(`${notificationRoute}/`)
      .then((res) => res.json())
      .then((data) => data);

    if (data.status !== 'success') throw new Error(data.message);

    localStore.setItem('notifications', data.notifications);
    this.notifications = data.notifications;
    return data;
  }

  updateRemoteData(type, payload) {
    switch (type) {
      case 'contacts': {
        this[type] = localStore.findAndUpdateElement('contacts', {
          key: '_id',
          value: payload._id,
          update: payload,
        });
        return this[type];
      }
      default:
        throw new Error(`No api for ${type} @updateRemoteData`);
    }
  }

  updateContactStatus(newStatus, contactId) {
    const { lastMessage } = localStore.findElement('contacts', {
      key: '_id',
      value: contactId,
    });
    if (lastMessage.wasReceived) return;
    const contact = localStore.findElement('contacts', {
      key: '_id',
      value: contactId,
    });
    if (!contact.lastMessage?.status) return;
    contact.lastMessage.status = newStatus;
    this.updateRemoteData('contacts', contact);
  }
}

export default new AppModel();
