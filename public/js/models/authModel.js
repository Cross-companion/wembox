import Config from '../config.js';
const { userRoute } = Config;

class SignupModel {
  constructor() {
    this.userDetails = {
      interests: [],
    };
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

  async login(identity, password) {
    const isEmail = identity.includes('@');
    const loginObj = {
      password,
      email: isEmail ? identity : undefined,
      username: isEmail ? undefined : identity,
    };

    const data = await fetch(`${userRoute}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginObj),
    })
      .then((res) => res.json())
      .then((data) => data);

    if (data.status !== 'success') throw new Error(data.message);

    return data;
  }

  async sendResetPasswordEmail(identity) {
    const isEmail = identity.includes('@');
    const reqObj = {
      email: isEmail ? identity : undefined,
      username: isEmail ? undefined : identity,
    };
    const data = await fetch(`${userRoute}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reqObj),
    })
      .then((res) => res.json())
      .then((data) => data);

    if (data.status !== 'success') throw new Error(data.message);

    return data;
  }

  async resetPassword(password, passwordConfirm, token) {
    if (!(password && passwordConfirm))
      throw new Error(
        'Please specify both your password and password confirmation'
      );

    const data = await fetch(`${userRoute}/reset-password/${token}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password, passwordConfirm, token }),
    })
      .then((res) => res.json())
      .then((data) => data);

    console.log(data.status, '/////', data.message);
    if (data.status !== 'success') throw new Error(data.message);

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

  async getInterests() {
    const interests = await fetch('../dev-data/interests.json')
      .then((res) => res.json())
      .then((data) => data);

    return interests;
  }

  async updateAfterSignup() {
    const dataObject = {
      interests: this.userDetails.interests,
      contentType: this.userDetails.contentType,
      profileImage: this.userDetails.profileImage,
      profileCoverImage: this.userDetails.profileCoverImage,
      geoLocation: this.userDetails.geoLocation,
    };

    await fetch(`${userRoute}/signup`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataObject),
    });
  }
}

export default new SignupModel();