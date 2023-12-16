class ResetPasswordView {
  constructor() {
    this.promptContainer = document.querySelector('#prompt-container');
    this.promptHeading = document.querySelector('#prompt-heading');
    this.promptForm = document.querySelector('#prompt-form');
    this.passwordInput = document.querySelector('#password');
    this.passwordConfirmInput = document.querySelector('#password-confirm');
    this.submitBtn = document.querySelector('#submit-input');
    this.btnResetText = 'Login';
  }
}

export default new ResetPasswordView();
