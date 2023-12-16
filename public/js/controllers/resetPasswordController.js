import { Gradient } from './Gradient.js';
import resetPasswordView from '../views/resetPasswordView.js';
import authModel from '../models/authModel.js';
class ResetPasswordController {
  constructor() {
    this.gradient();
    resetPasswordView.promptForm.addEventListener('submit', this.processForm);
  }

  gradient(canvas = '#gradient-canvas') {
    const gradient = new Gradient();
    gradient.initGradient(canvas);
  }

  processForm = async (e) => {
    e.preventDefault();
    if (resetPasswordView.submitBtn.dataset.btnStatus == 'pending') return;
    this.resetSubmitBtn();
    try {
      const password = resetPasswordView.passwordInput.value;
      const passwordConfirm = resetPasswordView.passwordConfirmInput.value;
      console.log(password, passwordConfirm);
      const token = this.extractUrlToken();
      await authModel.resetPassword(password, passwordConfirm, token);
      this.resetSubmitBtn(false);
      window.location.href = '/';
    } catch (err) {
      alert(err.message);
      this.resetSubmitBtn(false);
    }
  };

  extractUrlToken() {
    const pathnameArr = window.location.pathname.split('/');
    const token = pathnameArr[pathnameArr.length - 1];
    return token;
  }

  resetSubmitBtn(pending = true) {
    const resetText = resetPasswordView.btnResetText;
    resetPasswordView.submitBtn.value = pending ? 'Loading...' : resetText;
    resetPasswordView.submitBtn.style.opacity = pending ? 0.6 : 1;
    resetPasswordView.submitBtn.dataset.btnStatus = pending
      ? 'pending'
      : 'accepted';
  }
}

export default new ResetPasswordController();
