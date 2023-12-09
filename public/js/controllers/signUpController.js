import { Gradient } from './Gradient.js';
import Config from '../config.js';
import SignupViews from '../views/signupViews.js';

class SignUp {
  constructor() {
    this.init();
  }

  init() {
    this.gradient();
    this.setMinMaxDOB();
  }

  gradient(canvas = '#gradient-canvas') {
    const gradient = new Gradient();
    gradient.initGradient(canvas);
  }

  setMinMaxDOB(DOBInput = SignupViews.DOBInput) {
    const { maxDOB, minDOB } = this.getMinMaxDOB();
    // Set the min and max attributes
    DOBInput.setAttribute('min', maxDOB);
    DOBInput.setAttribute('max', minDOB);
    console.log(DOBInput);
  }

  getMinMaxDOB() {
    const today = new Date();
    const todaysMonth = today.getMonth() + 1;
    const todaysDate = today.getDate();
    const todaysYear = today.getFullYear();

    function formatForZero(number) {
      return number <= 9 ? '0' + number : number;
    }

    const maxDOB = `${todaysYear - Config.maxAge}-${formatForZero(
      todaysMonth
    )}-${formatForZero(todaysDate)}`;
    const minDOB = `${todaysYear - Config.minAge}-${formatForZero(
      todaysMonth
    )}-${formatForZero(todaysDate)}`;

    return { maxDOB, minDOB };
  }

  async recapcha() {
    const recaptcha = document.querySelector('#recaptcha');

    recaptcha.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const captcha = document.getElementById('g-recaptcha-response').value;
      if (!email || !captcha) return;

      const verified = await fetch('/api/v1/users/captcha', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({ captcha, email }),
      }).then((res) => res.json());

      console.log(verified);
    });
  }
}

export default new SignUp();
