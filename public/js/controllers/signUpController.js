import { Gradient } from './Gradient.js';
import Config from '../config.js';

class SignUp {
  constructor() {
    this.init();
  }

  init() {
    this.gradient();
    getMinMaxDOB();
  }

  gradient(canvas = '#gradient-canvas') {
    const gradient = new Gradient();
    gradient.initGradient(canvas);
  }

  getMinMaxDOB() {
    const todaysMonth = new Date().getMonth();
    const todaysDate = new Date().getDay();
    const todaysYear = new Date().getFullYear();
    const minDOB = `${todaysMonth}-${todaysDate}-${todaysYear - Config.minAge}`;
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
