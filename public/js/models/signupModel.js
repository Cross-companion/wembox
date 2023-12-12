import Config from '../config.js';
const { userRoute } = Config;

class SignupModel {
  constructor() {
    this.userDetails = {};
  }

  async storeUserDetails({ name, email, username, DOB } = {}) {
    if (!(name && email && username && DOB))
      throw new Error(
        'Incomplete details specified. Please fill all the input fields.'
      );

    this.userDetails = { name, email, username, DOB };
  }

  async sendEmailOTP(
    email = this.userDetails.email,
    name = this.userDetails.name
  ) {
    const data = await fetch(`${userRoute}/signup/send-email-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        name: name.split(' ')[0],
      }),
    })
      .then((res) => res.json())
      .then((data) => data);

    if (data.status !== 'success') throw new Error(data.message);

    return data;
  }

  async verifyOTP(otp) {
    const data = await fetch(`${userRoute}/signup/verify-email-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailOTP: otp,
        email: this.userDetails.email,
      }),
    })
      .then((res) => res.json())
      .then((data) => data);

    if (data.status !== 'success') throw new Error(data.message);

    return data;
  }

  async signup({ password, passwordConfirm, recaptcha } = {}) {
    if (!(password && passwordConfirm && recaptcha))
      throw new Error(
        'Incomplete details specified. Please try signing up again.'
      );
    const { name, email, username, DOB } = this.userDetails;
    const data = await fetch(`${userRoute}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        username,
        dateOfBirth: DOB,
        password,
        passwordConfirm,
        recaptcha,
      }),
    })
      .then((res) => res.json())
      .then((data) => data);

    if (data.status !== 'success') throw new Error(data.message);

    return data;
  }

  async login(username, password) {
    const data = await fetch(`${userRoute}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    })
      .then((res) => res.json())
      .then((data) => data);

    return data;
  }

  async dataExists(dataObject = { username, email }) {
    const data = await fetch(`${userRoute}/data-exists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataObject),
    })
      .then((res) => res.json())
      .then((data) => data);

    if (data.status !== 'success') throw new Error(data.message);

    return data;
  }

  recaptchaIsChecked() {
    const recaptchaResponse = grecaptcha.getResponse();
    if (recaptchaResponse.length !== 0) return true;
    else return false;
  }
}

export default new SignupModel();
