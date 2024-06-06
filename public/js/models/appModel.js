import Config from '../config.js';

const { contactRoute } = Config;
class AppModel {
  async getContacts() {
    // const data = await fetch(`/public/dev-data/contacts.json`)
    const data = await fetch(`${contactRoute}/`)
      .then((res) => res.json())
      .then((data) => data);

    if (data.status !== 'success') throw new Error(data.message);

    return data;
  }
}

export default new AppModel();
