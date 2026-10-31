/**
 * TruthLens — Authentication & Registration Controller
 * Handles client-side validation, password strength checking, confirm password matching,
 * strict password authentication, session management, and role-based routing.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==========================================
  // COMMON HELPER UTILITIES
  // ==========================================
  const validateEmail = (email) => {
    if (!email) return false;
    const clean = String(email).trim().toLowerCase();
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(clean);
  };

  const setInputState = (inputEl, isValid) => {
    if (!inputEl) return;
    if (isValid) {
      inputEl.classList.remove('is-invalid');
      inputEl.classList.add('is-valid');
    } else {
      inputEl.classList.remove('is-valid');
      inputEl.classList.add('is-invalid');
    }
  };

  const withTimeout = (promise, ms = 1000, fallbackValue = null) => {
    return Promise.race([
      promise,
      new Promise((resolve) => setTimeout(() => resolve(fallbackValue), ms))
    ]);
  };

  // Shared Password Visibility Toggler
  const togglePasswordBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  const togglePasswordIcon = document.getElementById('togglePasswordIcon');

  if (togglePasswordBtn && passwordInput && togglePasswordIcon) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      
      togglePasswordIcon.classList.toggle('bi-eye', !isPassword);
      togglePasswordIcon.classList.toggle('bi-eye-slash', isPassword);
      togglePasswordBtn.setAttribute(
        'aria-label',
        isPassword ? 'Hide password' : 'Show password'
      );
    });
  }

  // Known Default Demo Accounts with strict passwords (from FIREBASE_SETUP.md)
  const DEFAULT_CREDENTIALS = {
    'admin@truthlens.org': {
      id: 'usr-admin-1',
      name: 'Puja Mohapatra',
      email: 'admin@truthlens.org',
      password: 'Admin@12345',
      role: 'admin',
      title: 'Chief Editor & Administrator',
      department: 'Editorial Oversight',
      avatar: 'PM',
      status: 'Active'
    },
    'investigator@truthlens.org': {
      id: 'usr-investigator-1',
      name: 'Abinash Panigrahy',
      email: 'investigator@truthlens.org',
      password: 'Investigator@12345',
      role: 'investigator',
      title: 'Senior Forensic Analyst',
      department: 'Digital Forensics & AI',
      avatar: 'AP',
      status: 'Active'
    },
    'user@truthlens.org': {
      id: 'usr-user-1',
      name: 'Saumya Jit Mohanty',
      email: 'user@truthlens.org',
      password: 'User@12345',
      role: 'user',
      title: 'Community Fact-Checker',
      department: 'Public Contributor',
      avatar: 'SM',
      status: 'Active'
    }
  };

  // ==========================================
  // REGISTRATION PAGE LOGIC (`register.html`)
  // ==========================================
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    const fullNameInput = document.getElementById('fullName');
    const regEmailInput = document.getElementById('email');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const termsCheck = document.getElementById('termsCheck');
    
    const strengthBar = document.getElementById('passwordStrengthBar');
    const strengthText = document.getElementById('passwordStrengthText');
    
    const registerSubmitBtn = document.getElementById('registerSubmitBtn');
    const registerSpinner = document.getElementById('registerSpinner');
    const registerBtnText = document.getElementById('registerBtnText');
    
    const authAlert = document.getElementById('authAlert');
    const authAlertIcon = document.getElementById('authAlertIcon');
    const authAlertMessage = document.getElementById('authAlertMessage');

    const userRoleSelect = document.getElementById('userRoleSelect');
    const registerHeading = document.getElementById('registerHeading');
    const registerSubheading = document.getElementById('registerSubheading');

    const ROLE_CONFIGS = {
      user: {
        btnText: 'Create User Account',
        heading: 'Create User Account',
        subheading: 'Join the community fact-checking network to submit and track claims.',
        submittingText: 'Creating User Account...'
      },
      investigator: {
        btnText: 'Register Investigator Account',
        heading: 'Create Investigator Account',
        subheading: 'Set up your profile to begin managing forensic investigation cases.',
        submittingText: 'Registering Investigator Account...'
      },
      admin: {
        btnText: 'Register Administrator Account',
        heading: 'Create Administrator Account',
        subheading: 'Access editorial governance and system administration console.',
        submittingText: 'Registering Administrator Account...'
      }
    };

    const updateRoleUI = () => {
      const selected = userRoleSelect ? userRoleSelect.value : 'user';
      const config = ROLE_CONFIGS[selected] || ROLE_CONFIGS.user;
      if (registerBtnText && (!registerSubmitBtn || !registerSubmitBtn.disabled)) {
        registerBtnText.textContent = config.btnText;
      }
      if (registerHeading) {
        registerHeading.textContent = config.heading;
      }
      if (registerSubheading) {
        registerSubheading.textContent = config.subheading;
      }
    };

    if (userRoleSelect) {
      userRoleSelect.addEventListener('change', () => {
        updateRoleUI();
        hideAlert();
      });
    }

    // Synchronize UI on initial page load
    updateRoleUI();

    const showAlert = (message, isSuccess = false) => {
      if (!authAlert || !authAlertMessage) return;
      authAlertMessage.textContent = message;
      authAlert.classList.remove('d-none', 'alert-danger', 'alert-success');
      authAlert.classList.add('d-flex', isSuccess ? 'alert-success' : 'alert-danger');
      if (authAlertIcon) {
        authAlertIcon.className = isSuccess ? 'bi bi-check-circle-fill fs-6 flex-shrink-0' : 'bi bi-exclamation-triangle-fill fs-6 flex-shrink-0';
      }
    };

    const hideAlert = () => {
      if (!authAlert) return;
      authAlert.classList.add('d-none');
      authAlert.classList.remove('d-flex');
    };

    // Password Strength Evaluator
    const evaluatePasswordStrength = (pwd) => {
      let score = 0;
      if (!pwd) return { score: 0, text: 'Strength: Too short', class: 'bg-danger', width: '0%' };

      if (pwd.length >= 8) score++;
      if (/[A-Z]/.test(pwd)) score++;
      if (/[0-9]/.test(pwd)) score++;
      if (/[^A-Za-z0-9]/.test(pwd)) score++;

      switch (score) {
        case 0:
        case 1:
          return { text: 'Strength: Weak', class: 'bg-danger', width: '25%' };
        case 2:
          return { text: 'Strength: Fair', class: 'bg-warning', width: '50%' };
        case 3:
          return { text: 'Strength: Good', class: 'bg-info', width: '75%' };
        case 4:
          return { text: 'Strength: Strong', class: 'bg-success', width: '100%' };
        default:
          return { text: 'Strength: Too short', class: 'bg-danger', width: '0%' };
      }
    };

    // Live Validation Events
    if (fullNameInput) {
      fullNameInput.addEventListener('input', () => {
        setInputState(fullNameInput, fullNameInput.value.trim().length >= 2);
        hideAlert();
      });
    }

    if (regEmailInput) {
      regEmailInput.addEventListener('input', () => {
        setInputState(regEmailInput, validateEmail(regEmailInput.value.trim()));
        hideAlert();
      });
    }

    if (passwordInput && strengthBar && strengthText) {
      passwordInput.addEventListener('input', () => {
        const val = passwordInput.value;
        const evaluation = evaluatePasswordStrength(val);
        
        strengthBar.style.width = evaluation.width;
        strengthBar.className = `progress-bar ${evaluation.class}`;
        strengthText.textContent = evaluation.text;

        setInputState(passwordInput, val.length >= 8);

        if (confirmPasswordInput && confirmPasswordInput.value.length > 0) {
          setInputState(confirmPasswordInput, confirmPasswordInput.value === val);
        }
        hideAlert();
      });
    }

    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener('input', () => {
        const matches = confirmPasswordInput.value === passwordInput.value && confirmPasswordInput.value.length >= 8;
        setInputState(confirmPasswordInput, matches);
        hideAlert();
      });
    }

    if (termsCheck) {
      termsCheck.addEventListener('change', () => {
        if (termsCheck.checked) {
          termsCheck.classList.remove('is-invalid');
        }
      });
    }

    // Form Submission Handler
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const fullNameVal = fullNameInput.value.trim();
      const emailVal = regEmailInput.value.trim().toLowerCase();
      const passwordVal = passwordInput.value;
      const confirmVal = confirmPasswordInput ? confirmPasswordInput.value : '';
      const termsAccepted = termsCheck ? termsCheck.checked : true;

      const isNameValid = fullNameVal.length >= 2;
      const isEmailValid = validateEmail(emailVal);
      const isPasswordValid = passwordVal.length >= 8;
      const isMatchValid = confirmVal === passwordVal && isPasswordValid;

      setInputState(fullNameInput, isNameValid);
      setInputState(regEmailInput, isEmailValid);
      setInputState(passwordInput, isPasswordValid);
      if (confirmPasswordInput) setInputState(confirmPasswordInput, isMatchValid);

      if (termsCheck && !termsAccepted) {
        termsCheck.classList.add('is-invalid');
      } else if (termsCheck) {
        termsCheck.classList.remove('is-invalid');
      }

      if (!isNameValid || !isEmailValid || !isPasswordValid || !isMatchValid || !termsAccepted) {
        showAlert('Please resolve all validation errors highlighted in the form.');
        return;
      }

      // Check if email already registered
      try {
        const localUsers = JSON.parse(localStorage.getItem('truthlens_db_users') || '[]');
        if (Array.isArray(localUsers) && localUsers.some(u => u.email && u.email.toLowerCase() === emailVal)) {
          showAlert('An account with this email address already exists. Please sign in instead.');
          setInputState(regEmailInput, false);
          return;
        }
      } catch (_) {}

      const chosenRole = userRoleSelect ? userRoleSelect.value : 'user';
      const roleConfig = ROLE_CONFIGS[chosenRole] || ROLE_CONFIGS.user;
      const targetUrl = chosenRole === 'admin' ? 'admin-dashboard.html' : chosenRole === 'user' ? 'user-dashboard.html' : 'dashboard.html';

      registerSubmitBtn.disabled = true;
      registerSpinner.classList.remove('d-none');
      registerBtnText.textContent = roleConfig.submittingText;

      const newUserObj = {
        id: 'usr-' + Date.now(),
        name: fullNameVal,
        email: emailVal,
        password: passwordVal, // store password for credential matching
        role: chosenRole,
        title: chosenRole === 'admin' ? 'Editorial Administrator' : chosenRole === 'user' ? 'Community Fact-Checker' : 'Forensic Analyst',
        department: chosenRole === 'admin' ? 'Administration' : chosenRole === 'user' ? 'Public Contributor' : 'Forensics',
        avatar: fullNameVal.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'TL',
        status: 'Active',
        joinedDate: new Date().toISOString().split('T')[0]
      };

      // 1. Live Firebase Auth registration (if configured)
      if (window.TruthLensFirebase && window.TruthLensFirebase.isConfigured && window.TruthLensFirebase.auth) {
        try {
          const userCred = await withTimeout(
            window.TruthLensFirebase.auth.createUserWithEmailAndPassword(emailVal, passwordVal),
            1200,
            null
          );
          if (userCred && userCred.user) {
            newUserObj.id = userCred.user.uid;
            newUserObj.uid = userCred.user.uid;
          }
        } catch (authErr) {
          console.warn('[TruthLens Auth] Firebase Cloud Auth note:', authErr.message);
        }
      }

      // 2. Persist in Database & Session
      try {
        if (window.TruthLensDB && typeof window.TruthLensDB.createUser === 'function') {
          await withTimeout(window.TruthLensDB.createUser(newUserObj), 1000, newUserObj);
        }
        if (window.TruthLensDB && typeof window.TruthLensDB.setCurrentSession === 'function') {
          window.TruthLensDB.setCurrentSession(newUserObj);
        }
        registerSpinner.classList.add('d-none');
        showAlert('Account registered successfully! Redirecting to workspace...', true);
        setTimeout(() => { window.location.href = targetUrl; }, 600);
      } catch (err) {
        console.warn('[TruthLens Auth] Local registration fallback:', err);
        if (window.TruthLensDB && typeof window.TruthLensDB.setCurrentSession === 'function') {
          window.TruthLensDB.setCurrentSession(newUserObj);
        }
        registerSpinner.classList.add('d-none');
        showAlert('Account created! Redirecting to workspace...', true);
        setTimeout(() => { window.location.href = targetUrl; }, 600);
      }
    });
  }

  // ==========================================
  // LOGIN PAGE LOGIC (`login.html`)
  // ==========================================
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    const loginEmailInput = document.getElementById('email');
    const loginPasswordInput = document.getElementById('password');
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const loginSpinner = document.getElementById('loginSpinner');
    const loginBtnText = document.getElementById('loginBtnText');
    const authAlert = document.getElementById('authAlert');
    const authAlertMessage = document.getElementById('authAlertMessage');

    const showLoginAlert = (msg) => {
      if (!authAlert || !authAlertMessage) return;
      authAlertMessage.textContent = msg;
      authAlert.classList.remove('d-none');
      authAlert.classList.add('d-flex');
    };

    const hideLoginAlert = () => {
      if (!authAlert) return;
      authAlert.classList.add('d-none');
      authAlert.classList.remove('d-flex');
    };

    const restoreLoginButton = (text = 'Sign In to Dashboard') => {
      if (loginSubmitBtn) loginSubmitBtn.disabled = false;
      if (loginSpinner) loginSpinner.classList.add('d-none');
      if (loginBtnText) loginBtnText.textContent = text;
    };

    // Live validation
    if (loginEmailInput) {
      loginEmailInput.addEventListener('input', () => {
        const val = loginEmailInput.value.trim();
        setInputState(loginEmailInput, validateEmail(val));
        hideLoginAlert();
      });
    }

    if (loginPasswordInput) {
      loginPasswordInput.addEventListener('input', () => {
        setInputState(loginPasswordInput, loginPasswordInput.value.length >= 6);
        hideLoginAlert();
      });
    }

    // -------------------------------------------------------------
    // Main Form Submit Handler with Strict Password Authentication
    // -------------------------------------------------------------
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideLoginAlert();

      const rawEmail = (loginEmailInput.value || '').trim();
      const enteredPassword = loginPasswordInput.value || '';

      const isEmailValid = validateEmail(rawEmail);
      const isPwdValid = enteredPassword.length >= 6;

      setInputState(loginEmailInput, isEmailValid);
      setInputState(loginPasswordInput, isPwdValid);

      if (!isEmailValid) {
        showLoginAlert('Please enter a valid email address.');
        return;
      }

      if (!isPwdValid) {
        showLoginAlert('Password must be at least 6 characters.');
        return;
      }

      loginSubmitBtn.disabled = true;
      loginSpinner.classList.remove('d-none');
      loginBtnText.textContent = 'Verifying credentials...';

      try {
        const lowerEmail = rawEmail.toLowerCase();
        let resolvedUser = null;
        let expectedPassword = null;

        // 1. Check known default demo accounts
        if (DEFAULT_CREDENTIALS[lowerEmail]) {
          resolvedUser = DEFAULT_CREDENTIALS[lowerEmail];
          expectedPassword = resolvedUser.password;
        }

        // 2. Check registered accounts in localStorage
        if (!resolvedUser) {
          try {
            const localUsers = JSON.parse(localStorage.getItem('truthlens_db_users') || '[]');
            if (Array.isArray(localUsers)) {
              const found = localUsers.find(u => u.email && u.email.toLowerCase() === lowerEmail);
              if (found) {
                resolvedUser = found;
                expectedPassword = found.password || null;
              }
            }
          } catch (_) {}
        }

        // 3. Check Firestore database if configured
        if (!resolvedUser && window.TruthLensDB && typeof window.TruthLensDB.getUser === 'function') {
          try {
            const dbUser = await withTimeout(window.TruthLensDB.getUser(lowerEmail), 600, null);
            if (dbUser) {
              resolvedUser = dbUser;
              expectedPassword = dbUser.password || null;
            }
          } catch (err) {
            console.warn('[TruthLens Auth] DB user query note:', err);
          }
        }

        // -------------------------------------------------------
        // ACCOUNT EXISTENCE CHECK
        // If no user exists with this email, DO NOT log in!
        // -------------------------------------------------------
        if (!resolvedUser) {
          restoreLoginButton('Sign In to Dashboard');
          setInputState(loginEmailInput, false);
          showLoginAlert('No account found with this email. Please check your credentials or register an account.');
          return;
        }

        // -------------------------------------------------------
        // PASSWORD AUTHENTICATION CHECK
        // If password does not match, DO NOT log in!
        // -------------------------------------------------------
        let isAuthenticated = false;

        // A. Match against stored expected password (demo or registered accounts)
        if (expectedPassword) {
          if (enteredPassword === expectedPassword) {
            isAuthenticated = true;
          } else {
            // Password mismatch: reject immediately!
            restoreLoginButton('Sign In to Dashboard');
            setInputState(loginPasswordInput, false);
            showLoginAlert('Incorrect password. Please verify your password and try again.');
            return;
          }
        } else if (window.TruthLensFirebase && window.TruthLensFirebase.isConfigured && window.TruthLensFirebase.auth) {
          // Cloud-only user lookup in Firebase Auth
          try {
            const authResult = await withTimeout(
              window.TruthLensFirebase.auth.signInWithEmailAndPassword(lowerEmail, enteredPassword),
              1200,
              null
            );
            if (authResult && authResult.user) {
              isAuthenticated = true;
            }
          } catch (cloudErr) {
            console.warn('[TruthLens Auth] Firebase Cloud Auth rejected credentials:', cloudErr.code || cloudErr.message);
          }
        }

        if (!isAuthenticated) {
          restoreLoginButton('Sign In to Dashboard');
          setInputState(loginPasswordInput, false);
          showLoginAlert('Incorrect password. Please verify your password and try again.');
          return;
        }

        // -------------------------------------------------------
        // SUCCESSFUL AUTHENTICATION: Launch user session
        // -------------------------------------------------------
        const role = resolvedUser.role || 'user';
        const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
        const targetDashboard = role === 'admin' ? 'admin-dashboard.html' : role === 'user' ? 'user-dashboard.html' : 'dashboard.html';

        loginBtnText.textContent = `Signing in as ${roleLabel}...`;

        // Store active session
        if (window.TruthLensDB && typeof window.TruthLensDB.setCurrentSession === 'function') {
          window.TruthLensDB.setCurrentSession(resolvedUser);
        }

        // Update last active in background
        if (window.TruthLensDB && typeof window.TruthLensDB.updateUserProfile === 'function') {
          window.TruthLensDB.updateUserProfile(resolvedUser.id, { lastActive: new Date().toISOString() }).catch(() => {});
        }

        // Redirect to user's authorized dashboard
        setTimeout(() => {
          window.location.href = targetDashboard;
        }, 300);

      } catch (err) {
        console.error('[TruthLens Auth] Unexpected authentication error:', err);
        restoreLoginButton('Sign In to Dashboard');
        showLoginAlert('An error occurred during authentication. Please check your credentials and try again.');
      }
    });

    // -------------------------------------------------------------
    // Forgot Password Modal Handler
    // -------------------------------------------------------------
    const btnSendReset = document.getElementById('btnSendReset');
    const resetEmailInput = document.getElementById('resetEmail');
    const resetSuccessAlert = document.getElementById('resetSuccessAlert');

    if (btnSendReset && resetEmailInput) {
      btnSendReset.addEventListener('click', () => {
        const raw = resetEmailInput.value.trim();
        const valid = raw && validateEmail(raw);
        if (!valid) {
          resetEmailInput.classList.add('is-invalid');
          return;
        }
        resetEmailInput.classList.remove('is-invalid');
        btnSendReset.disabled = true;
        btnSendReset.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status"></span> Dispatching...';

        setTimeout(() => {
          btnSendReset.innerHTML = '<i class="bi bi-check-circle-fill me-1"></i> Dispatched';
          btnSendReset.classList.remove('btn-tl-primary');
          btnSendReset.classList.add('btn-success');
          if (resetSuccessAlert) {
            resetSuccessAlert.classList.remove('d-none');
            resetSuccessAlert.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i> Recovery instructions dispatched to <strong>${raw}</strong> if an investigator profile exists.`;
          }
        }, 600);
      });
    }
  }

  // ==========================================
  // PROGRAMMATIC AUTH SWITCHER (Used by dashboard session switchers)
  // ==========================================
  window.TruthLensAuth = {
    loginAs: (role) => {
      const mapping = {
        admin: {
          user: DEFAULT_CREDENTIALS['admin@truthlens.org'],
          target: 'admin-dashboard.html'
        },
        investigator: {
          user: DEFAULT_CREDENTIALS['investigator@truthlens.org'],
          target: 'dashboard.html'
        },
        user: {
          user: DEFAULT_CREDENTIALS['user@truthlens.org'],
          target: 'user-dashboard.html'
        }
      };

      const targetRole = mapping[role] || mapping.investigator;
      if (window.TruthLensDB && typeof window.TruthLensDB.setCurrentSession === 'function') {
        window.TruthLensDB.setCurrentSession(targetRole.user);
      }
      window.location.href = targetRole.target;
    }
  };
});
