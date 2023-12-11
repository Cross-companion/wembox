import { Gradient } from './Gradient.js';
import Config from '../config.js';
import signupViews from '../views/signupViews.js';
import signupModel from '../models/signupModel.js';

const { reCaptchaKey } = Config;

class SignupController {
  constructor() {
    this.promptTypes = ['signup', 'login'];
    this.promptStates = { active: 'active', inactive: 'inactive' };
    this.init();
  }

  init() {
    this.tooglePrompt();
    this.gradient();
    this.setMinMaxDOB();
    signupViews.promptForm.addEventListener('submit', this.processForm);
    signupViews.promptContainer.addEventListener('click', (e) => {
      const target = e.target;
      if (target.dataset.isPromptBtn !== 'true') return;
      if (target.dataset.state === this.promptStates.active) return;
      const { promptType } = target.dataset;
      if (!this.promptTypes.includes(promptType))
        throw new Error('Invalid promptType');
      this.tooglePrompt(promptType);
    });
  }

  tooglePrompt(promptType = this.promptTypes[0]) {
    const { heading, form, crossCheck } =
      signupViews[`${promptType}PromptHTML`]();
    signupViews.promptHeading.innerHTML = heading;
    signupViews.promptForm.innerHTML = form;
    signupViews.promptCrossCheck.innerHTML = crossCheck;
    signupViews.promptHeadBtn.forEach((el) => {
      if (el.dataset.state === this.promptStates.inactive)
        el.dataset.state = this.promptStates.active;
      else el.dataset.state = this.promptStates.inactive;
    });
    if (promptType === this.promptTypes[0]) {
      signupViews.redefineElementsAtSignup();
      this.setMinMaxDOB();
    } else signupViews.redefineElementsAtLogin();

    signupViews.promptForm.setAttribute('data-form-for', promptType);
    signupViews.promptForm.setAttribute('data-dialogue', `${promptType}-1`);
  }

  resetSubmitBtn(pending = true) {
    const resetText = signupViews.btnResetText;
    signupViews.submitBtn.value = pending ? 'Loading...' : resetText;
    signupViews.submitBtn.style.opacity = pending ? 0.6 : 1;
    signupViews.submitBtn.dataset.btnStatus = pending ? 'pending' : 'accepted';
  }

  processForm = async (e) => {
    e.preventDefault();
    if (signupViews.submitBtn.dataset.btnStatus == 'pending') return;
    this.resetSubmitBtn();
    const positionOfDialogueNum = 1;
    const { formFor, dialogue } = e.target.dataset;
    const dialogueNum = +dialogue.split('-')[positionOfDialogueNum];

    if (formFor === this.promptTypes[0]) this.processSignup(dialogueNum);
    else this.processLogin();
  };

  async processSignup(dialogueNum) {
    if (dialogueNum === 1) {
      const name = signupViews.nameInput.value;
      const email = signupViews.emailInput.value;
      const username = signupViews.usernameInput.value;
      const DOB = signupViews.DOBInput.value;
      if (!(name && email && username && DOB)) return;
      const dataExists = await signupModel.storeUserDetails(dialogueNum, {
        name,
        email,
        username,
        DOB,
      });
      this.resetSubmitBtn(false);
      if (dataExists) {
        const errMsg = 'username or password already exist';
        alert(errMsg);
        throw new Error(errMsg);
      }
      this.showSignupDialogueTwo();
      return;
    }

    if (dialogueNum === 2) {
      const password = signupViews.passwordInput.value;
      const passwordConfirm = signupViews.passwordConfirmInput.value;
      const recaptcha = document.querySelector('#g-recaptcha-response').value;

      try {
        const check = await signupModel.storeUserDetails(dialogueNum, {
          password,
          passwordConfirm,
          recaptcha,
        });
        this.resetSubmitBtn(false);
        alert('Email has been sent');
      } catch (err) {
        alert(err.message);
        this.resetSubmitBtn(false);
      }
    }
  }

  showSignupDialogueTwo() {
    const dialogueNum = 2;
    signupViews.promptForm.innerHTML = signupViews.signupDialogueTwo();
    signupViews.promptForm.setAttribute(
      'data-dialogue',
      `${this.promptTypes[0]}-${dialogueNum}`
    );
    signupViews.redefineElementsAtSignup(dialogueNum);
    this.recaptcha();
  }

  processLogin() {}

  gradient(canvas = '#gradient-canvas') {
    const gradient = new Gradient();
    gradient.initGradient(canvas);
  }

  setMinMaxDOB(DOBInput = signupViews.DOBInput) {
    const { maxDOB, minDOB } = this.getMinMaxDOB();
    // Set the min and max attributes
    DOBInput.setAttribute('min', maxDOB);
    DOBInput.setAttribute('max', minDOB);
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

  async recaptcha() {
    const captchaContainer = signupViews.captchaContainer;
    captchaContainer.innerHTML = '';

    grecaptcha.render(captchaContainer, {
      sitekey: reCaptchaKey,
    });
    //   const recaptcha = document.querySelector('#recaptcha');
    //   recaptcha.addEventListener('submit', async (e) => {
    //     e.preventDefault();
    //     const email = document.getElementById('email').value;
    //     const captcha = document.getElementById('g-recaptcha-response').value;
    //     if (!email || !captcha) return;
    //     const verified = await fetch('/api/v1/users/captcha', {
    //       method: 'POST',
    //       headers: {
    //         'Content-type': 'application/json',
    //       },
    //       body: JSON.stringify({ captcha, email }),
    //     }).then((res) => res.json());
    //     console.log(verified);
    //   });
  }
}

export default new SignupController();
