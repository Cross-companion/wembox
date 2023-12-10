import Config from '../config.js';
const { userRoute } = Config;

class SignupModel {
  constructor() {
    this.userDetails = {};
  }

  async storeUserDetails(dialogueNum, { name, email, username, DOB }) {
    if (!(dialogueNum && name && email && username && DOB)) return;
    const { dataExists } = await this.dataExists({ username, email });

    if (!dataExists) {
      this.userDetails = { name, email, username, DOB };
    }

    return dataExists;
  }

  async dataExists(dataObject = { username, email }) {
    const dataAlreadyExists = await fetch(`${userRoute}/data-exists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataObject), // Convert object to JSON string
    }).then((res) => res.json());

    return dataAlreadyExists;
  }
}

export default new SignupModel();
