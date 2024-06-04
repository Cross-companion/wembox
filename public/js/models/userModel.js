import Config from '../config.js';

const { userRoute } = Config;

class UserModel {
  async updateMe(formData) {
    formData.forEach((element) => {
      console.log(element);
    });
    const data = await fetch(`${userRoute}/me`, {
      method: 'PATCH',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => data);

    console.log(data);
    if (data.status !== 'success') throw new Error(data.message);

    return data;
  }
}

export default new UserModel();
