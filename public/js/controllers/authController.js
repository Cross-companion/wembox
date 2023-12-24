import Config from '../config.js';
import { Gradient } from './Gradient.js';
import appForm from './appForm.js';
import authViews from '../views/authViews.js';
import authModel from '../models/authModel.js';

const { reCaptchaKey, maxAge, minAge } = Config;

class SignupController {
  constructor() {
    this.promptTypes = ['signup', 'login'];
    this.promptStates = { active: 'active', inactive: 'inactive' };
    this.init();
  }

  init() {
    this.tooglePrompt();
    this.gradient();
    authViews.promptForm.addEventListener('submit', this.processForm);
    authViews.promptContainer.addEventListener('click', (e) => {
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
    if (!authViews.onLoadMessage) return;
    const message = authViews.onLoadMessage.dataset.message;
    message && alert(message);
    authViews.onLoadMessage.remove();
  }

  tooglePrompt(promptType = this.promptTypes[0]) {
    const { heading, form, crossCheck } = authViews[`${promptType}Dialogue1`]();
    authViews.promptHeading.innerHTML = heading;
    authViews.promptForm.innerHTML = form;
    authViews.promptCrossCheck.innerHTML = crossCheck;
    authViews.promptHeadBtn.forEach((el) => {
      if (el.dataset.promptType === promptType)
        el.dataset.state = this.promptStates.active;
      else el.dataset.state = this.promptStates.inactive;
    });
    if (promptType === this.promptTypes[0]) {
      authViews.redefineElementsAtSignup();
      this.setMinMaxDOB();
    } else {
      authViews.redefineElementsAtLogin();
      authViews.forgotPasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.changeDialogue(2, 1);
      });
    }

    authViews.promptForm.setAttribute('data-form-for', promptType);
    authViews.promptForm.setAttribute('data-dialogue', `${promptType}-1`);
  }

  resetSubmitBtn(pending = true) {
    const resetText = authViews.btnResetText;
    authViews.submitBtn.value = pending ? 'Loading...' : resetText;
    authViews.submitBtn.style.opacity = pending ? 0.6 : 1;
    authViews.submitBtn.dataset.btnStatus = pending ? 'pending' : 'accepted';
  }

  processForm = async (e) => {
    e.preventDefault();
    if (authViews.submitBtn.dataset.btnStatus == 'pending') return;
    this.resetSubmitBtn();
    const positionOfDialogueNum = 1;
    const { formFor, dialogue } = e.target.dataset;
    const dialogueNum = +dialogue.split('-')[positionOfDialogueNum];
    if (formFor === this.promptTypes[0]) this.processSignup(dialogueNum);
    else this.processLogin(dialogueNum);
  };

  async processSignup(dialogueNum) {
    if (dialogueNum === 1) {
      const name = authViews.nameInput.value;
      const email = authViews.emailInput.value;
      const username = authViews.usernameInput.value;
      const DOB = authViews.DOBInput.value;
      if (!(name && email && username && DOB)) return;
      try {
        await authModel.dataExists({ username, email });
        await authModel.storeUserDetails({
          name,
          email,
          username,
          DOB,
        });
        const { message } = await authModel.sendEmailOTP(email);
        alert(message);
        this.changeDialogue(2);
        authViews.otpLabel.textContent = `${authViews.otpLabelText} ${authModel.userDetails.email}`;
        authViews.OTPContainer.addEventListener('keyup', (e) => {
          const target = e.target;
          if (target.dataset.inputType !== 'OTP') return;
          appForm.watchOTPInput(e.target);
        });
        authViews.OTPContainer.addEventListener('paste', (e) => {
          e.preventDefault();
          const target = e.target;
          if (target.dataset.inputType !== 'OTP') return;
          const pastedText = (e.clipboardData || window.Clipboard).getData(
            'text'
          );
          pastedText.length &&
            appForm.formatPastedOTP(authViews.OTPNodeList, pastedText, target);
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
        const OTP = appForm.getOTPInput(authViews.OTPNodeList);
        const { message } = await authModel.verifyOTP(OTP);
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
      const password = authViews.passwordInput.value;
      const passwordConfirm = authViews.passwordConfirmInput.value;
      const recaptcha = document.querySelector('#g-recaptcha-response').value;

      try {
        await authModel.signup({
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
    const { heading, form, crossCheck } = authViews[dialogueDataFunction]();
    heading && (authViews.promptHeading.innerHTML = heading);
    form && (authViews.promptForm.innerHTML = form);
    crossCheck && (authViews.promptCrossCheck.innerHTML = crossCheck);
    authViews.promptForm.setAttribute(
      'data-dialogue',
      `${promptType}-${dialogueNum}`
    );
    const capitalisedPromptType = `${promptType
      .charAt(0)
      .toUpperCase()}${promptType.slice(1)}`;
    authViews[`redefineElementsAt${capitalisedPromptType}`](dialogueNum);
  }

  async processLogin(dialogueNum) {
    if (dialogueNum === 1) {
      const identity = authViews.identityDataInput.value;
      const password = authViews.passwordInput.value;
      try {
        await authModel.login(identity, password);
        this.resetSubmitBtn(false);
        location.reload();
      } catch (err) {
        alert(err.message);
        this.resetSubmitBtn(false);
      }
    }

    if (dialogueNum === 2) {
      try {
        const identity = authViews.identityDataInput.value;
        await authModel.sendResetPasswordEmail(identity);
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
      authViews.forgotPasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.changeDialogue(2, 1);
      });
    }
  }

  gradient(canvas = '#gradient-canvas') {
    const gradient = new Gradient();
    gradient.initGradient(canvas);
  }

  setMinMaxDOB(DOBInput = authViews.DOBInput) {
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

    const maxDOB = `${todaysYear - maxAge}-${formatForZero(
      todaysMonth
    )}-${formatForZero(todaysDate)}`;
    const minDOB = `${todaysYear - minAge}-${formatForZero(
      todaysMonth
    )}-${formatForZero(todaysDate)}`;

    return { maxDOB, minDOB };
  }

  async recaptcha() {
    const captchaContainer = authViews.captchaContainer;
    captchaContainer.innerHTML = '';

    grecaptcha.render(captchaContainer, {
      sitekey: reCaptchaKey,
    });
  }
}

export default new SignupController();
