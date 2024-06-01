class AppModel {
  async getContacts() {
    const data = await fetch(`/public/dev-data/contacts.json`)
      .then((res) => res.json())
      .then((data) => data);

    return data;
  }
}

export default new AppModel();
