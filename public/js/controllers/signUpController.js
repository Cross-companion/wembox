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
    this.fireOnloadMessage();
  }

  fireOnloadMessage() {
    if (!signupViews.onLoadMessage) return;
    const message = signupViews.onLoadMessage.dataset.message;
    message && alert(message);
    signupViews.onLoadMessage.remove();
  }

  tooglePrompt(promptType = this.promptTypes[0]) {
    const { heading, form, crossCheck } =
      signupViews[`${promptType}Dialogue1`]();
    signupViews.promptHeading.innerHTML = heading;
    signupViews.promptForm.innerHTML = form;
    signupViews.promptCrossCheck.innerHTML = crossCheck;
    signupViews.promptHeadBtn.forEach((el) => {
      if (el.dataset.promptType === promptType)
        el.dataset.state = this.promptStates.active;
      else el.dataset.state = this.promptStates.inactive;
    });
    if (promptType === this.promptTypes[0]) {
      signupViews.redefineElementsAtSignup();
      this.setMinMaxDOB();
    } else {
      signupViews.redefineElementsAtLogin();
      signupViews.forgotPasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.changeDialogue(2, 1);
      });
    }

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
    else this.processLogin(dialogueNum);
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
        location.reload();
      } catch (err) {
        alert(err.message);
        this.resetSubmitBtn(false);
      }
      return;
    }
  }

  changeDialogue(dialogueNum = 1, promptTypeIndex = 0) {
    const promptType = this.promptTypes[promptTypeIndex];
    const dialogueDataFunction = `${promptType}Dialogue${dialogueNum}`;
    const { heading, form, crossCheck } = signupViews[dialogueDataFunction]();
    heading && (signupViews.promptHeading.innerHTML = heading);
    form && (signupViews.promptForm.innerHTML = form);
    crossCheck && (signupViews.promptCrossCheck.innerHTML = crossCheck);
    signupViews.promptForm.setAttribute(
      'data-dialogue',
      `${promptType}-${dialogueNum}`
    );
    const capitalisedPromptType = `${promptType
      .charAt(0)
      .toUpperCase()}${promptType.slice(1)}`;
    signupViews[`redefineElementsAt${capitalisedPromptType}`](dialogueNum);
  }

  async processLogin(dialogueNum) {
    if (dialogueNum === 1) {
      const identity = signupViews.identityDataInput.value;
      const password = signupViews.passwordInput.value;
      try {
        await signupModel.login(identity, password);
        this.resetSubmitBtn(false);
        location.reload();
      } catch (err) {
        alert(err.message);
        this.resetSubmitBtn(false);
      }
    }

    if (dialogueNum === 2) {
      try {
        const identity = signupViews.identityDataInput.value;
        await signupModel.sendResetPasswordEmail(identity);
        alert('reset password link sent 🎉🎉');
        this.resetSubmitBtn(false);
        this.changeDialogue(3, 1);
      } catch (err) {
        alert(err.message);
        this.resetSubmitBtn(false);
      }
    }

    if (dialogueNum === 3) {
      this.changeDialogue(1, 1);
      signupViews.forgotPasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.changeDialogue(2, 1);
      });
    }
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
