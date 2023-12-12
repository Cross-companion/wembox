class AppForm {
  watchOTPInput(OTPInput) {
    const value = OTPInput.value;
    if (value.length > 1) {
      OTPInput.value = value[0];
      const nextSibling = OTPInput.nextElementSibling;
      if (!nextSibling) return;
      nextSibling.value = value[value.length - 1];
      nextSibling.focus();
      return;
    }
    if (value.length < 1) {
      const previousSibling = OTPInput.previousElementSibling;
      if (!previousSibling) return;
      OTPInput.previousElementSibling.focus();
      return;
    }
    if (value.length === 1) {
      const nextSibling = OTPInput.nextElementSibling;
      if (!nextSibling) return;
      nextSibling.focus();
      return;
    }
  }

  getOTPInput(OTPNodeList) {
    const OTP = [...OTPNodeList].reduce((acc, node) => {
      const value = node.value;
      if (!value)
        throw new Error('Invalid otp token. Please input the entire OTP');
      acc += value;
      return acc;
    }, '');
    return OTP;
  }

  formatPastedOTP(OTPNodeList, pastedText, target) {
    [...OTPNodeList].reduce((acc, node, i) => {
      if (node === target) acc++;
      if (!acc) return acc;
      OTPNodeList[i].value = pastedText[acc - 1]
        ? pastedText[acc - 1]
        : OTPNodeList[i].value;
      acc++;
      return acc;
    }, 0);
  }
}

export default new AppForm();
