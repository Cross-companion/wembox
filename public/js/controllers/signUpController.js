import { Gradient } from './Gradient.js';
import Config from '../config.js';
import appForm from '../appForm.js';
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
      signupViews[`${promptType}Dialogue1`]();
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
      try {
        await signupModel.dataExists({ username, email });
        await signupModel.storeUserDetails({
          name,
          email,
          username,
          DOB,
        });
        const { message } = await signupModel.sendEmailOTP(email);
        alert(message);
        this.changeDialogue(2);
        signupViews.OTPContainer.addEventListener('keyup', (e) => {
          const target = e.target;
          if (target.dataset.inputType !== 'OTP') return;
          appForm.watchOTPInput(e.target);
        });
        signupViews.OTPContainer.addEventListener('paste', (e) => {
          e.preventDefault();
          const target = e.target;
          if (target.dataset.inputType !== 'OTP') return;
          const pastedText = (e.clipboardData || window.Clipboard).getData(
            'text'
          );
          pastedText.length &&
            appForm.formatPastedOTP(
              signupViews.OTPNodeList,
              pastedText,
              target
            );
        });
        this.resetSubmitBtn(false);
        return;
      } catch (err) {
        this.resetSubmitBtn(false);
        alert(`ERROR: ${err.message}`);
      }
      return;
    }

    if (dialogueNum === 2) {
      try {
        const OTP = appForm.getOTPInput(signupViews.OTPNodeList);
        const { message } = await signupModel.verifyOTP(OTP);
        alert(message);
        this.changeDialogue(3);
        this.recaptcha();
        this.resetSubmitBtn(false);
      } catch (err) {
        this.resetSubmitBtn(false);
        alert(err.message);
      }
      return;
    }

    if (dialogueNum === 3) {
      const password = signupViews.passwordInput.value;
      const passwordConfirm = signupViews.passwordConfirmInput.value;
      const recaptcha = document.querySelector('#g-recaptcha-response').value;

      try {
        await signupModel.signup({
          password,
          passwordConfirm,
          recaptcha,
        });
        this.resetSubmitBtn(false);
        alert('Signed up complete!🎉🎉');
      } catch (err) {
        alert(err.message);
        this.resetSubmitBtn(false);
      }
      return;
    }
  }

  changeDialogue(dialogueNum = 1, promptTypeNum = 0) {
    const promptType = this.promptTypes[promptTypeNum];
    const dialogueDataFunction = `${promptType}Dialogue${dialogueNum}`;
    signupViews.promptForm.innerHTML = signupViews[dialogueDataFunction]().form;
    signupViews.promptForm.setAttribute(
      'data-dialogue',
      `${promptType}-${dialogueNum}`
    );
    signupViews.redefineElementsAtSignup(dialogueNum);
  }

  processLogin() {
    // const identityData =
  }

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
  }
}

export default new SignupController();
