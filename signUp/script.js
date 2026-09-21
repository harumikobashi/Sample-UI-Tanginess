document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signUpForm');
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const submitButton = document.getElementById('signUpButton');

  const errorBanner = document.getElementById('errorBanner');
  const successBanner = document.getElementById('successBanner');

  const firstNameError = document.getElementById('firstNameError');
  const lastNameError = document.getElementById('lastNameError');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const confirmPasswordError = document.getElementById('confirmPasswordError');

  function clearErrors() {
    errorBanner.textContent = '';
    errorBanner.classList.remove('visible');
    successBanner.textContent = '';
    successBanner.classList.remove('visible');

    [firstNameInput, lastNameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
      if (input) input.classList.remove('input-error');
    });

    [firstNameError, lastNameError, emailError, passwordError, confirmPasswordError].forEach(msg => {
      if (msg) msg.classList.remove('visible');
    });
  }

  // Clear errors when user types
  [firstNameInput, lastNameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        input.classList.remove('input-error');
        const errSpan = document.getElementById(`${input.id}Error`);
        if (errSpan) errSpan.classList.remove('visible');
        errorBanner.classList.remove('visible');
      });
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    let hasError = false;
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const role = 'customer';

    if (!firstName) {
      firstNameInput.classList.add('input-error');
      firstNameError.classList.add('visible');
      hasError = true;
    }

    if (!lastName) {
      lastNameInput.classList.add('input-error');
      lastNameError.classList.add('visible');
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      emailInput.classList.add('input-error');
      emailError.textContent = 'Please enter a valid email address.';
      emailError.classList.add('visible');
      hasError = true;
    }

    if (!password || password.length < 8) {
      passwordInput.classList.add('input-error');
      passwordError.textContent = 'Password must be at least 8 characters.';
      passwordError.classList.add('visible');
      hasError = true;
    }

    if (password !== confirmPassword) {
      confirmPasswordInput.classList.add('input-error');
      confirmPasswordError.textContent = 'Passwords do not match.';
      confirmPasswordError.classList.add('visible');
      hasError = true;
    }

    if (hasError) return;

    if (!window.TanginessAuth) {
      errorBanner.textContent = 'Authentication service is unavailable. Please reload.';
      errorBanner.classList.add('visible');
      return;
    }

    const result = window.TanginessAuth.register({
      firstName,
      lastName,
      email,
      password,
      role
    });

    if (!result.success) {
      errorBanner.textContent = result.message;
      errorBanner.classList.add('visible');
      if (result.field) {
        const targetInput = document.getElementById(result.field);
        const targetError = document.getElementById(`${result.field}Error`);
        if (targetInput) targetInput.classList.add('input-error');
        if (targetError) {
          targetError.textContent = result.message;
          targetError.classList.add('visible');
        }
      }
      return;
    }

    // Success
    successBanner.textContent = 'Account created successfully! Redirecting to login...';
    successBanner.classList.add('visible');
    submitButton.disabled = true;

    setTimeout(() => {
      window.location.href = `../logIn/index.html?registered=true&email=${encodeURIComponent(email)}`;
    }, 1500);
  });
});

