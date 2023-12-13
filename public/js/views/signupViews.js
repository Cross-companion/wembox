import appForm from '../appForm.js';

class SignupViews {
  constructor() {
    this.promptContainer = document.querySelector('#prompt-container');
    this.promptHeadBtn = document.querySelectorAll('[data-prompt-btn="head"]');
    this.promptHeading = document.querySelector('#prompt-heading');
    this.promptForm = document.querySelector('#prompt-form');
    this.promptCrossCheck = document.querySelector('#prompt-cross-check');
  }

  signupDialogue1() {
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

  signupDialogue2() {
    this.btnResetText = 'Verify';
    const form = `
      <div id="otp-container" class="otp-container">
        <input
          type="number"
          data-input-type="OTP"
          name="OTP"
          min="0"
          max="9"
          required
        />
        <input
          type="number"
          data-input-type="OTP"
          name="OTP"
          min="0"
          max="9"
          required
        />
        <input
          type="number"
          data-input-type="OTP"
          name="OTP"
          min="0"
          max="9"
          required
        />
        <input
          type="number"
          data-input-type="OTP"
          name="OTP"
          min="0"
          max="9"
          required
        />
        <input
          type="number"
          data-input-type="OTP"
          name="OTP"
          min="0"
          max="9"
          required
        />
        <input
          type="number"
          data-input-type="OTP"
          name="OTP"
          min="0"
          max="9"
          required
        />
      </div>
      <input
        type="submit"
        id="submit-input"
        value="${this.btnResetText}"
        class="btn btn__main"
        required
      />`;

    return { form };
  }

  signupDialogue3() {
    this.btnResetText = 'Signup!';
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

    return { form };
  }

  loginDialogue1() {
    this.btnResetText = 'Login';
    const heading = `
    <div class="signup-prompt__head-text">Login.</div>
    <span class="signup-prompt__head-cross-check"
    >Not having an account yet?
    <a href="#" 
    id="login-link-btn" 
    data-is-prompt-btn="true"
    data-prompt-type="signup">Sign-up</a></span
    >`;
    const form = `
    <input
    type="text"
    id="identity-data"
    name="identity-data"
    placeholder="Your email or username"
    required
    />
    <label for="identity-data">Your email or username</label>
    <input
    type="password"
    id="password"
    name="password"
    placeholder="Password"
    required
    />
    <label for="password">Password</label>
    <input
    type="submit"
    id="submit-input"
    value="${this.btnResetText}"
    class="btn btn__main"
    required
    />`;
    const crossCheck = `
    <div>Not having an account yet?</div>
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

  redefineElementsAtSignup(dialogueNum = 1) {
    if (dialogueNum === 1) {
      this.nameInput = document.querySelector('#name-input');
      this.emailInput = document.querySelector('#email-input');
      this.usernameInput = document.querySelector('#username-input');
      this.DOBInput = document.querySelector('#DOB-input');
      this.submitBtn = document.querySelector('#submit-input');
      return;
    }

    if (dialogueNum === 2) {
      this.OTPContainer = document.querySelector('#otp-container');
      this.OTPNodeList = document.querySelectorAll('[data-input-type="OTP"]');
      this.submitBtn = document.querySelector('#submit-input');
      return;
    }

    if (dialogueNum === 3) {
      this.passwordInput = document.querySelector('#password');
      this.passwordConfirmInput = document.querySelector('#password-confirm');
      this.captchaContainer = document.querySelector('#captcha-container');
      this.submitBtn = document.querySelector('#submit-input');
      return;
    }
  }

  redefineElementsAtLogin() {
    this.passwordInput = document.querySelector('#password');
    this.identityDataInput = document.querySelector('#identity-data');
    this.submitBtn = document.querySelector('#submit-input');
  }
}

export default new SignupViews();
