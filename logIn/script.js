document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const loginButton = document.getElementById('loginButton');

  const errorBanner = document.getElementById('errorBanner');
  const successBanner = document.getElementById('successBanner');
  const usernameError = document.getElementById('usernameError');
  const passwordError = document.getElementById('passwordError');

  // Check URL query params for redirected feedback
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('registered') === 'true') {
    const email = urlParams.get('email');
    if (email && usernameInput) {
      usernameInput.value = email;
    }
    successBanner.textContent = 'Account created successfully! Please enter your password to log in.';
    successBanner.classList.add('visible');
  } else if (urlParams.get('reset') === 'true') {
    const email = urlParams.get('email');
    if (email && usernameInput) {
      usernameInput.value = email;
    }
    successBanner.textContent = 'Password reset successfully! Please log in with your new password.';
    successBanner.classList.add('visible');
  } else if (urlParams.get('logout') === 'true') {
    successBanner.textContent = 'You have been logged out successfully.';
    successBanner.classList.add('visible');
  }


  function clearErrors() {
    errorBanner.textContent = '';
    errorBanner.classList.remove('visible');
    successBanner.textContent = '';
    successBanner.classList.remove('visible');

    [usernameInput, passwordInput].forEach(inp => {
      if (inp) inp.classList.remove('input-error');
    });

    [usernameError, passwordError].forEach(span => {
      if (span) span.classList.remove('visible');
    });
  }

  [usernameInput, passwordInput].forEach(inp => {
    if (inp) {
      inp.addEventListener('input', () => {
        inp.classList.remove('input-error');
        const errSpan = document.getElementById(`${inp.id}Error`);
        if (errSpan) errSpan.classList.remove('visible');
        errorBanner.classList.remove('visible');
      });
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    const usernameVal = usernameInput.value.trim();
    const passwordVal = passwordInput.value;
    let hasError = false;

    if (!usernameVal) {
      usernameInput.classList.add('input-error');
      usernameError.classList.add('visible');
      hasError = true;
    }

    if (!passwordVal) {
      passwordInput.classList.add('input-error');
      passwordError.classList.add('visible');
      hasError = true;
    }

    if (hasError) return;

    if (!window.TanginessAuth) {
      errorBanner.textContent = 'Authentication service is unavailable. Please reload.';
      errorBanner.classList.add('visible');
      return;
    }

    const result = window.TanginessAuth.login(usernameVal, passwordVal);

    if (!result.success) {
      errorBanner.textContent = result.message || 'Invalid username/email or password.';
      errorBanner.classList.add('visible');
      usernameInput.classList.add('input-error');
      passwordInput.classList.add('input-error');
      return;
    }

    // Successfully authenticated
    const user = result.user;
    loginButton.disabled = true;
    successBanner.textContent = `Welcome back, ${user.name}! Redirecting...`;
    successBanner.classList.add('visible');

    setTimeout(() => {
      if (user.role === 'admin' || user.role === 'staff') {
        window.location.href = `../Sample-UI-Tanginess/index.html?role=${encodeURIComponent(user.role)}`;
      } else {
        window.location.href = '../Sample-UI-Tanginess/index.html?role=customer';
      }
    }, 800);
  });
});
