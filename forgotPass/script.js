document.addEventListener('DOMContentLoaded', () => {
  const step1 = document.getElementById('stepRequestOtp');
  const step2 = document.getElementById('stepResetPassword');

  const form1 = document.getElementById('forgotPasswordForm');
  const resetEmailInput = document.getElementById('resetEmail');
  const sendOtpButton = document.getElementById('sendOtpButton');
  const resetEmailError = document.getElementById('resetEmailError');

  const form2 = document.getElementById('resetPasswordForm');
  const otpCodeInput = document.getElementById('otpCode');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
  const resetPasswordButton = document.getElementById('resetPasswordButton');
  const resendCodeButton = document.getElementById('resendCodeButton');

  const otpCodeError = document.getElementById('otpCodeError');
  const newPasswordError = document.getElementById('newPasswordError');
  const confirmNewPasswordError = document.getElementById('confirmNewPasswordError');

  const errorBanner = document.getElementById('errorBanner');
  const successBanner = document.getElementById('successBanner');
  const otpSuccessBanner = document.getElementById('otpSuccessBanner');
  const resetSuccessBanner = document.getElementById('resetSuccessBanner');

  let currentResetEmail = '';

  function clearAllMessages() {
    errorBanner.textContent = '';
    errorBanner.classList.remove('visible');
    successBanner.textContent = '';
    successBanner.classList.remove('visible');
    otpSuccessBanner.innerHTML = '';
    otpSuccessBanner.classList.remove('visible');
    resetSuccessBanner.textContent = '';
    resetSuccessBanner.classList.remove('visible');

    [resetEmailInput, otpCodeInput, newPasswordInput, confirmNewPasswordInput].forEach(inp => {
      if (inp) inp.classList.remove('input-error');
    });

    [resetEmailError, otpCodeError, newPasswordError, confirmNewPasswordError].forEach(span => {
      if (span) span.classList.remove('visible');
    });
  }

  [resetEmailInput, otpCodeInput, newPasswordInput, confirmNewPasswordInput].forEach(inp => {
    if (inp) {
      inp.addEventListener('input', () => {
        inp.classList.remove('input-error');
        const errSpan = document.getElementById(`${inp.id}Error`);
        if (errSpan) errSpan.classList.remove('visible');
        errorBanner.classList.remove('visible');
      });
    }
  });

  // STEP 1: Request OTP
  form1.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAllMessages();

    const emailVal = resetEmailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailVal || !emailRegex.test(emailVal)) {
      resetEmailInput.classList.add('input-error');
      resetEmailError.textContent = 'Please enter a valid email address.';
      resetEmailError.classList.add('visible');
      return;
    }

    if (!window.TanginessAuth) {
      errorBanner.textContent = 'Authentication service is unavailable. Please reload.';
      errorBanner.classList.add('visible');
      return;
    }

    const result = window.TanginessAuth.requestPasswordReset(emailVal);

    if (!result.success) {
      errorBanner.textContent = result.message;
      errorBanner.classList.add('visible');
      resetEmailInput.classList.add('input-error');
      return;
    }

    // Success: Advance to Step 2
    currentResetEmail = result.email;
    step1.style.display = 'none';
    step2.style.display = 'block';

    otpSuccessBanner.innerHTML = `Verification code sent to <strong>${currentResetEmail}</strong>.<br>Demo verification code: <strong style="font-size: 16px; letter-spacing: 1px;">${result.otp}</strong>`;
    otpSuccessBanner.classList.add('visible');

    // Auto pre-fill the demo OTP for user convenience
    if (otpCodeInput) {
      otpCodeInput.value = result.otp;
      newPasswordInput.focus();
    }
  });

  // STEP 2: Reset Password
  form2.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAllMessages();

    const otpVal = otpCodeInput.value.trim();
    const newPassVal = newPasswordInput.value;
    const confirmPassVal = confirmNewPasswordInput.value;
    let hasError = false;

    if (!otpVal || otpVal.length !== 6) {
      otpCodeInput.classList.add('input-error');
      otpCodeError.textContent = 'Please enter the 6-digit verification code.';
      otpCodeError.classList.add('visible');
      hasError = true;
    }

    if (!newPassVal || newPassVal.length < 8) {
      newPasswordInput.classList.add('input-error');
      newPasswordError.textContent = 'Password must be at least 8 characters.';
      newPasswordError.classList.add('visible');
      hasError = true;
    }

    if (newPassVal !== confirmPassVal) {
      confirmNewPasswordInput.classList.add('input-error');
      confirmNewPasswordError.textContent = 'Passwords do not match.';
      confirmNewPasswordError.classList.add('visible');
      hasError = true;
    }

    if (hasError) return;

    const result = window.TanginessAuth.confirmPasswordReset(currentResetEmail, otpVal, newPassVal);

    if (!result.success) {
      errorBanner.textContent = result.message;
      errorBanner.classList.add('visible');
      return;
    }

    resetSuccessBanner.textContent = 'Password has been reset successfully! Redirecting to Log In...';
    resetSuccessBanner.classList.add('visible');
    resetPasswordButton.disabled = true;

    setTimeout(() => {
      window.location.href = `../logIn/index.html?reset=true&email=${encodeURIComponent(currentResetEmail)}`;
    }, 1500);
  });

  // Resend code
  if (resendCodeButton) {
    resendCodeButton.addEventListener('click', () => {
      if (!currentResetEmail) return;
      clearAllMessages();
      const result = window.TanginessAuth.requestPasswordReset(currentResetEmail);
      if (result.success) {
        otpSuccessBanner.innerHTML = `New verification code generated.<br>Demo verification code: <strong style="font-size: 16px; letter-spacing: 1px;">${result.otp}</strong>`;
        otpSuccessBanner.classList.add('visible');
        if (otpCodeInput) otpCodeInput.value = result.otp;
      } else {
        errorBanner.textContent = result.message;
        errorBanner.classList.add('visible');
      }
    });
  }
});

