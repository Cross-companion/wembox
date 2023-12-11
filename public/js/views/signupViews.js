class SignupViews {
  constructor() {
    this.promptContainer = document.querySelector('#prompt-container');
    this.promptHeadBtn = document.querySelectorAll('[data-prompt-btn="head"]');
    this.promptHeading = document.querySelector('#prompt-heading');
    this.promptForm = document.querySelector('#prompt-form');
    this.promptCrossCheck = document.querySelector('#prompt-cross-check');
  }

  signupPromptHTML() {
    this.btnResetText = 'Next';
    const heading = `
      <div class="signup-prompt__head-text">Quick Signup.</div>
      <span class="signup-prompt__head-cross-check"
        >Already have an account?
        <a href="#" id="login-link-btn" 
        data-is-prompt-btn="true"
        data-prompt-type="login">login</a>
      </span>`;
    const form = `
      <input
        type="text"
        id="name-input"
        name="name"
        value="Nwodoh"
        placeholder="name"
        required
      />
      <label for="name-input">Name</label>
      <input
        type="email"
        id="email-input"
        name="email"
        value="me@me"
        placeholder="email"
        required
      />
      <label for="email-input">Email</label>
      <input
        type="text"
        id="username-input"
        name="username"
        value="me"
        placeholder="username"
        pattern="^[A-Za-z_][A-Za-z0-9_]*$"
        required
      />
      <label for="username-input">Username</label>
      <input
        type="date"
        placeholder="Date of Birth"
        id="DOB-input"
        value="2003-06-06"
        name="DOB"
        required
      />
      <label for="DOB-input">Date of Birth</label>
      <input
        type="submit"
        id="submit-input"
        value="${this.btnResetText}"
        class="btn btn__main"
        required
      />`;
    const crossCheck = `
      <div>Already have an account?</div>
        <button
          class="btn btn__main btn__main--red"
          type="button"
          data-is-prompt-btn="true"
          data-prompt-type="login"
        >
         login
        </button>`;
    return { heading, form, crossCheck };
  }

  loginPromptHTML() {
    const heading = `
    <div class="signup-prompt__head-text">Login.</div>
    <span class="signup-prompt__head-cross-check"
    >Not having an account?
    <a href="#" 
    id="login-link-btn" 
    data-is-prompt-btn="true"
    data-prompt-type="signup">Sign-up</a></span
    >`;
    const form = `
    <input
    type="text"
    id="username-or-email"
    name="username-or-email"
    placeholder="username or email"
    required
    />
    <label for="username-or-email">Username or email</label>
    <input
    type="password"
    id="login-password"
    name="login-password"
    placeholder="Password"
    required
    />
    <label for="login-password">Password</label>
    <input
    type="submit"
    id=""submit-input
    value="Login"
    class="btn btn__main"
    required
    />`;
    const crossCheck = `
    <div>Not having an account?</div>
    <button
    class="btn btn__main btn__main--red"
    type="button"
    data-is-prompt-btn="true"
    data-prompt-type="signup"
    >
    Signup
    </button>`;
    return { heading, form, crossCheck };
  }

  signupDialogueTwo() {
    this.btnResetText = 'Next';
    const form = `
    <input
      type="password"
      id="password"
      name="password"
      placeholder="Password"
      minlength="8"
      maxlength="25"
      value="#1234567eR"
      autocomplete="current-password"
      pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,25}$"
      required
    />
    <label for="password">Password</label>
    <input
      type="password"
      id="password-confirm"
      name="confirm-password"
      placeholder="Confirm password"
      minlength="8"
      maxlength="25"
      value="#1234567eR"
      autocomplete="current-password"
      pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,25}$"
      required
    />
    <label for="password-confirm">Confirm password</label>
    <div
      id="captcha-container"
      data-sitekey="6LeEx4EnAAAAABjh7VHeMAe9_0K8sLe5oKndw4dU"
    ></div>
    <input
      type="submit"
      id="submit-input"
      value="${this.btnResetText}"
      class="btn btn__main"
      required
    />`;

    return form;
  }

  redefineElementsAtSignup(dialogueNum = 1) {
    if (dialogueNum === 1) {
      this.nameInput = document.querySelector('#name-input');
      this.emailInput = document.querySelector('#email-input');
      this.usernameInput = document.querySelector('#username-input');
      this.DOBInput = document.querySelector('#DOB-input');
      this.submitBtn = document.querySelector('#submit-input');
    }

    if (dialogueNum === 2) {
      this.passwordInput = document.querySelector('#password');
      this.passwordConfirmInput = document.querySelector('#password-confirm');
      this.captchaContainer = document.querySelector('#captcha-container');
      this.submitBtn = document.querySelector('#submit-input');
    }
  }

  redefineElementsAtLogin() {
    // this.DOBInput = document.querySelector('#DOB-input');
  }
}

export default new SignupViews();
