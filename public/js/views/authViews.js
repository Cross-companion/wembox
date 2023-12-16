class AuthViews {
  constructor() {
    this.promptContainer = document.querySelector('#prompt-container');
    this.promptHeadBtn = document.querySelectorAll('[data-prompt-btn="head"]');
    this.promptHeading = document.querySelector('#prompt-heading');
    this.promptForm = document.querySelector('#prompt-form');
    this.promptCrossCheck = document.querySelector('#prompt-cross-check');
    this.onLoadMessage = document?.querySelector(
      '[data-type="onload-message"]'
    );
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
        max-length="30"
        required
      />
      <label for="name-input">Name</label>
      <input
        type="email"
        id="email-input"
        name="email"
        value="me2@me.com"
        placeholder="email"
        max-length="320"
        required
      />
      <label for="email-input">Email</label>
      <input
        type="text"
        id="username-input"
        name="username"
        value="me2"
        placeholder="username"
        pattern="^[A-Za-z_][A-Za-z0-9_]*$"
        max-length="15"
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
      <div><label for="first-otp-input" id="first-otp-input-label"></label></div>
      <div id="otp-container" class="otp-container">
        <br />
        <input
          type="number"
          data-input-type="OTP"
          id="first-otp-input"
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
    max-length="15"
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
    <a href="#" id="forgot-password" data-link-type="extra">forgot password?</a>
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

  loginDialogue2() {
    this.btnResetText = 'Send email';
    const heading = `
    <div class="signup-prompt__head-text">Forgot Password?</div>
    <span class="signup-prompt__head-cross-check"
    >We'll send you a reset password link via your email address.</span>`;
    const form = `
    <input
    type="text"
    id="identity-data"
    name="identity-data"
    placeholder="Your email or username"
    required
    />
    <label for="identity-data">your email or username?</label>
    <input
    type="submit"
    id="submit-input"
    value="${this.btnResetText}"
    class="btn btn__main"
    required
    />`;

    return { heading, form };
  }

  loginDialogue3() {
    this.btnResetText = 'Back to login';
    const heading = `
    <div class="signup-prompt__head-text">Reset password mail sent. <p style="font-size: 1.6rem">We sent a reset password mail to you via your email address.</p></div>
    <p class="signup-prompt__head-cross-check"
    >Click on the link to reset your Wembox password.</p>`;
    const form = `
    <input
    type="submit"
    id="submit-input"
    value="${this.btnResetText}"
    class="btn btn__main"
    required
    />`;

    return { heading, form };
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
      this.otpLabel = document.querySelector('#first-otp-input-label');
      this.otpLabelText =
        'Please input the Six digit token sent to your email - ';

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

  redefineElementsAtLogin(dialogueNum = 1) {
    if (dialogueNum === 1) {
      this.passwordInput = document.querySelector('#password');
      this.identityDataInput = document.querySelector('#identity-data');
      this.forgotPasswordBtn = document.querySelector('#forgot-password');
      this.submitBtn = document.querySelector('#submit-input');
    }

    if (dialogueNum === 2) {
      this.identityDataInput = document.querySelector('#identity-data');
      this.submitBtn = document.querySelector('#submit-input');
    }

    if (dialogueNum === 3) {
      this.submitBtn = document.querySelector('#submit-input');
    }
  }
}

export default new AuthViews();
