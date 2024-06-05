import Config from '../config.js';

const { userRoute } = Config;

class UserModel {
  async updateMe(formData) {
    const data = await fetch(`${userRoute}/me`, {
      method: 'PATCH',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => data);

    if (data.status !== 'success') throw new Error(data.message);

    return data;
  }
}

export default new UserModel();
