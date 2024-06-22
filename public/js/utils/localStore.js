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

  findElement(propertyName, { key, value }) {
    const data = this.getItem(propertyName) || [];
    const element = data.find(
      (element) => element[key] === value || element === value
    );
    return element || null;
  }

  findAndUpdateElement(propertyName = '', { key, value, update, sortBy }) {
    const data = this.getItem(propertyName) || [];
    const newData = data.filter(
      (element) => element[key] !== value && element !== value
    );
    newData.unshift(update);
    this.setItem(propertyName, newData);
    return newData;
  }
}

export default new LocalStore();
