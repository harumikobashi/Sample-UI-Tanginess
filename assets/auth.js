/**
 * Tanginess Frozen Yogurt - Authentication & User Management Module
 * Supports Admin, Staff/Cashier, and Customer accounts with localStorage persistence.
 */

(function () {
  const USERS_STORAGE_KEY = 'tanginess_users';
  const CURRENT_USER_KEY = 'tanginess_current_user';
  const PENDING_RESET_KEY = 'tanginess_pending_reset';

  // Default accounts
  const DEFAULT_ACCOUNTS = [
    {
      id: 'usr_admin_01',
      username: 'admin',
      email: 'admin@tanginess.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'Manager',
      role: 'admin', // 'admin' | 'staff' | 'customer'
      isStatic: true, // Cannot be edited, password cannot be changed
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'usr_staff_01',
      username: 'cashier',
      email: 'cashier@tanginess.com',
      password: 'Staff123!',
      firstName: 'Maria',
      lastName: 'Cashier',
      role: 'staff',
      isStatic: false,
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'usr_cust_01',
      username: 'customer',
      email: 'customer@tanginess.com',
      password: 'Customer123!',
      firstName: 'Alex',
      lastName: 'Customer',
      role: 'customer',
      isStatic: false,
      createdAt: '2026-01-01T00:00:00.000Z'
    }
  ];

  const TanginessAuth = {
    /**
     * Initializes users in localStorage if not already present.
     * Always ensures the static admin account exists and retains its default static properties.
     */
    init: function () {
      let users = this.getUsers();
      if (!users || !Array.isArray(users) || users.length === 0) {
        this.saveUsers(DEFAULT_ACCOUNTS);
        return;
      }

      // Ensure default admin always exists and remains static
      const adminIndex = users.findIndex(u => u.role === 'admin' || u.username === 'admin');
      if (adminIndex === -1) {
        users.unshift(DEFAULT_ACCOUNTS[0]);
        this.saveUsers(users);
      } else {
        // Enforce static attributes on admin
        users[adminIndex].isStatic = true;
        users[adminIndex].username = 'admin';
        users[adminIndex].email = 'admin@tanginess.com';
        users[adminIndex].password = 'Admin123!';
        this.saveUsers(users);
      }

      // Ensure staff and customer defaults exist if deleted
      if (!users.some(u => u.username === 'cashier' || u.email === 'cashier@tanginess.com')) {
        users.push(DEFAULT_ACCOUNTS[1]);
        this.saveUsers(users);
      }
      if (!users.some(u => u.username === 'customer' || u.email === 'customer@tanginess.com')) {
        users.push(DEFAULT_ACCOUNTS[2]);
        this.saveUsers(users);
      }
    },

    /**
     * Retrieve all stored users
     */
    getUsers: function () {
      try {
        const raw = localStorage.getItem(USERS_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.error('Error reading users from storage:', e);
        return [];
      }
    },

    /**
     * Save users array to localStorage
     */
    saveUsers: function (users) {
      try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      } catch (e) {
        console.error('Error saving users to storage:', e);
      }
    },

    /**
     * Find a user by either email or username (case-insensitive)
     */
    findUser: function (identifier) {
      if (!identifier) return null;
      const cleanId = String(identifier).trim().toLowerCase();
      const users = this.getUsers();
      return users.find(
        u => (u.email && u.email.toLowerCase() === cleanId) ||
             (u.username && u.username.toLowerCase() === cleanId)
      ) || null;
    },

    /**
     * Authenticate user with identifier and password
     */
    login: function (identifier, password) {
      this.init();
      if (!identifier || !password) {
        return { success: false, message: 'Email/username and password are required.' };
      }

      const user = this.findUser(identifier);
      if (!user) {
        return { success: false, message: 'Invalid email/username or password.' };
      }

      if (user.password !== password) {
        return { success: false, message: 'Invalid email/username or password.' };
      }

      // Create session payload (without exposing sensitive password)
      const sessionUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
        role: user.role,
        isStatic: !!user.isStatic
      };

      this.setCurrentUser(sessionUser);
      return { success: true, user: sessionUser };
    },

    /**
     * Register a new user
     */
    register: function ({ firstName, lastName, email, password, role = 'customer' }) {
      this.init();

      if (!firstName || !firstName.trim()) {
        return { success: false, field: 'firstName', message: 'First name is required.' };
      }
      if (!lastName || !lastName.trim()) {
        return { success: false, field: 'lastName', message: 'Last name is required.' };
      }
      if (!email || !email.trim()) {
        return { success: false, field: 'email', message: 'Valid email is required.' };
      }

      const emailClean = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailClean)) {
        return { success: false, field: 'email', message: 'Please enter a valid email address.' };
      }

      if (!password || password.length < 8) {
        return { success: false, field: 'password', message: 'Password must be at least 8 characters.' };
      }

      // Registration is strictly for Customer accounts. Admin and Cashier accounts cannot be created via Sign Up.
      if (emailClean === 'admin@tanginess.com' || emailClean === 'cashier@tanginess.com' || role === 'admin' || role === 'staff') {
        if (role === 'admin' || emailClean === 'admin@tanginess.com') {
          return {
            success: false,
            field: 'email',
            message: 'The Admin role and credentials are restricted and cannot be registered.'
          };
        }
        if (role === 'staff' || emailClean === 'cashier@tanginess.com') {
          return {
            success: false,
            field: 'email',
            message: 'Staff / Cashier accounts cannot be registered here. Sign Up is for customers only.'
          };
        }
      }

      // Check if email already registered
      if (this.findUser(emailClean)) {
        return {
          success: false,
          field: 'email',
          message: 'An account with this email address already exists. Please log in.'
        };
      }

      // Auto-generate username from email prefix
      let baseUsername = emailClean.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
      if (!baseUsername) baseUsername = 'user';
      let username = baseUsername;
      let counter = 1;
      while (this.findUser(username)) {
        username = `${baseUsername}${counter++}`;
      }

      // Strictly customer
      const userRole = 'customer';

      const newUser = {
        id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        username: username,
        email: emailClean,
        password: password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: userRole,
        isStatic: false,
        createdAt: new Date().toISOString()
      };

      const users = this.getUsers();
      users.push(newUser);
      this.saveUsers(users);

      return { success: true, user: newUser };
    },

    /**
     * Initiate password reset by email. Generates demo OTP.
     * Enforces that the default static Admin account password CANNOT be changed.
     */
    requestPasswordReset: function (email) {
      this.init();

      if (!email || !email.trim()) {
        return { success: false, message: 'Please enter your email address.' };
      }

      const emailClean = email.trim().toLowerCase();
      const user = this.findUser(emailClean);

      if (!user) {
        return { success: false, message: 'No account found with this email address.' };
      }

      // Strict enforcement: Admin password is static and cannot be changed
      if (user.isStatic || user.role === 'admin' || user.username === 'admin' || emailClean === 'admin@tanginess.com') {
        return {
          success: false,
          isStaticAdmin: true,
          message: 'The Admin account is default/static and its password cannot be changed.'
        };
      }

      // Generate a 6-digit OTP code for demo/verification
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const resetData = {
        email: user.email,
        otp: otp,
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 mins
      };

      try {
        sessionStorage.setItem(PENDING_RESET_KEY, JSON.stringify(resetData));
      } catch (e) {
        console.error('Session storage error:', e);
      }

      return {
        success: true,
        email: user.email,
        otp: otp,
        message: `Reset code generated for ${user.email}.`
      };
    },

    /**
     * Verify OTP and set a new password
     */
    confirmPasswordReset: function (email, otp, newPassword) {
      this.init();

      if (!email || !otp || !newPassword) {
        return { success: false, message: 'All fields are required.' };
      }

      const emailClean = email.trim().toLowerCase();
      const user = this.findUser(emailClean);

      if (!user) {
        return { success: false, message: 'User not found.' };
      }

      if (user.isStatic || user.role === 'admin') {
        return {
          success: false,
          message: 'The Admin account is default/static and its password cannot be changed.'
        };
      }

      if (newPassword.length < 8) {
        return { success: false, message: 'Password must be at least 8 characters.' };
      }

      // Check OTP
      let pendingReset = null;
      try {
        const raw = sessionStorage.getItem(PENDING_RESET_KEY);
        if (raw) pendingReset = JSON.parse(raw);
      } catch (e) {}

      if (!pendingReset || pendingReset.email.toLowerCase() !== emailClean) {
        return { success: false, message: 'Reset session expired. Please request a new code.' };
      }

      if (pendingReset.otp !== String(otp).trim()) {
        return { success: false, message: 'Invalid verification code. Please check and try again.' };
      }

      if (Date.now() > pendingReset.expiresAt) {
        return { success: false, message: 'Verification code has expired. Please request a new code.' };
      }

      // Update user password in storage
      const users = this.getUsers();
      const idx = users.findIndex(u => u.email.toLowerCase() === emailClean);
      if (idx === -1) {
        return { success: false, message: 'Failed to find user account to update.' };
      }

      users[idx].password = newPassword;
      this.saveUsers(users);

      try {
        sessionStorage.removeItem(PENDING_RESET_KEY);
      } catch (e) {}

      return { success: true, message: 'Password has been updated successfully.' };
    },

    /**
     * Get active logged-in user
     */
    getCurrentUser: function () {
      try {
        const raw = sessionStorage.getItem(CURRENT_USER_KEY) || localStorage.getItem(CURRENT_USER_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },

    /**
     * Set active user session
     */
    setCurrentUser: function (user) {
      try {
        sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      } catch (e) {
        console.error('Failed to set current user:', e);
      }
    },

    /**
     * Clear session on logout
     */
    logout: function () {
      try {
        sessionStorage.removeItem(CURRENT_USER_KEY);
        localStorage.removeItem(CURRENT_USER_KEY);
      } catch (e) {}
    },

    /**
     * Check if currently logged in user is admin or staff
     */
    isStaffOrAdmin: function () {
      const user = this.getCurrentUser();
      return user && (user.role === 'admin' || user.role === 'staff');
    }
  };

  // Initialize on script load
  TanginessAuth.init();

  // Expose globally
  window.TanginessAuth = TanginessAuth;
})();

