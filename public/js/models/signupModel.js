import Config from '../config.js';
const { userRoute } = Config;

class SignupModel {
  constructor() {
    this.userDetails = {};
  }

  async storeUserDetails(
    dialogueNum,
    { name, email, username, DOB, password, passwordConfirm, recaptcha }
  ) {
    if (!dialogueNum)
      alert(`Invalid dialogueNum @storeUserDetails: ${dialogueNum}`);

    if (dialogueNum === 1) {
      if (!(name && email && username && DOB)) return;
      const { dataExists } = await this.dataExists({ username, email });
      if (!dataExists) this.userDetails = { name, email, username, DOB };
      return dataExists;
    }

    if (dialogueNum === 2) {
      if (password !== passwordConfirm) {
        return alert('Passwords are not the same. Please try again JORR.');
      }
      if (!this.recaptchaIsChecked()) {
        return alert('Please complete the reCAPTCHA challenge JORR.');
      }

      alert(`${password} = ${passwordConfirm} JORR`);

      this.userDetails.password = password;

      console.log({
        email: this.userDetails.email,
        name: this.userDetails.name.split(' ')[0],
      });
      const check = await fetch(`${userRoute}/recaptcha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: this.userDetails.email,
          name: this.userDetails.name.split(' ')[0],
          recaptcha,
        }),
      }).then((res) => res.json());

      console.log(check);
    }
  }

  async dataExists(dataObject = { username, email }) {
    const dataAlreadyExists = await fetch(`${userRoute}/data-exists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataObject),
    }).then((res) => res.json());

    return dataAlreadyExists;
  }

  recaptchaIsChecked() {
    const recaptchaResponse = grecaptcha.getResponse();
    if (recaptchaResponse.length !== 0) return true;
    else return false;
  }
}

export default new SignupModel();
