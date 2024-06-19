class LocalStore {
  getItem(propertyName = '') {
    const data = JSON.parse(localStorage.getItem(propertyName));
    return data;
  }

  setItem(propertyName = '', value) {
    const data = localStorage.setItem(propertyName, JSON.stringify(value));
    return data;
  }

  removeItem(propertyName = '') {
    const data = localStorage.removeItem(propertyName);
    return data;
  }
}

export default new LocalStore();
