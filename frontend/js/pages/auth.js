import app from '../app/app.js';
import { authAPI } from '../services/authService.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize notifications if available
    if (app && app.notifications) {
        try {
            app.notifications.initialize();
        } catch (e) {}
    }

    // Check if already logged in (only force redirect on standalone login.html)
    if (localStorage.getItem('token') && window.location.pathname.includes('login.html')) {
        window.location.href = 'dashboard.html';
        return;
    }

    const loginFormContainer = document.getElementById('login-form-container');
    const registerFormContainer = document.getElementById('register-form-container');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');

    // Modal elements for popup on index.html
    const authModal = document.getElementById('auth-modal');
    const closeAuthModalBtn = document.getElementById('close-auth-modal-btn');
    const openLoginBtns = document.querySelectorAll('.open-login-modal');
    const openRegisterBtns = document.querySelectorAll('.open-register-modal');

    function openModal(tab = 'login') {
        if (localStorage.getItem('token')) {
            window.location.href = 'dashboard.html';
            return;
        }
        if (!authModal) return;

        if (tab === 'login') {
            if (loginFormContainer) loginFormContainer.classList.remove('hidden-form');
            if (registerFormContainer) registerFormContainer.classList.add('hidden-form');
        } else {
            if (registerFormContainer) registerFormContainer.classList.remove('hidden-form');
            if (loginFormContainer) loginFormContainer.classList.add('hidden-form');
        }

        authModal.classList.remove('hidden');
        setTimeout(() => {
            authModal.classList.add('opacity-100');
            const innerCard = authModal.querySelector('.transform');
            if (innerCard) {
                innerCard.classList.remove('scale-95');
                innerCard.classList.add('scale-100');
            }
        }, 10);
    }

    function closeModal() {
        if (!authModal) return;
        authModal.classList.remove('opacity-100');
        const innerCard = authModal.querySelector('.transform');
        if (innerCard) {
            innerCard.classList.remove('scale-100');
            innerCard.classList.add('scale-95');
        }
        setTimeout(() => {
            authModal.classList.add('hidden');
        }, 300);
    }

    openLoginBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('login');
        });
    });

    openRegisterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('register');
        });
    });

    if (closeAuthModalBtn) {
        closeAuthModalBtn.addEventListener('click', closeModal);
    }

    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !authModal.classList.contains('hidden')) {
                closeModal();
            }
        });
    }

    // Password Visibility Toggle
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.parentElement.querySelector('input');
            const icon = toggle.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('ph-eye');
                icon.classList.add('ph-eye-closed');
            } else {
                input.type = 'password';
                icon.classList.remove('ph-eye-closed');
                icon.classList.add('ph-eye');
            }
        });
    });

    // Toggle forms with smooth fade inside container
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', () => {
            if (loginFormContainer) loginFormContainer.classList.add('hidden-form');
            setTimeout(() => {
                if (registerFormContainer) registerFormContainer.classList.remove('hidden-form');
            }, 150);
        });
    }

    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', () => {
            if (registerFormContainer) registerFormContainer.classList.add('hidden-form');
            setTimeout(() => {
                if (loginFormContainer) loginFormContainer.classList.remove('hidden-form');
            }, 150);
        });
    }

    // Auto-switch tab if URL has ?tab=register or ?tab=login
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tab') === 'register') {
        if (authModal) {
            openModal('register');
        } else {
            if (loginFormContainer) loginFormContainer.classList.add('hidden-form');
            if (registerFormContainer) registerFormContainer.classList.remove('hidden-form');
        }
    } else if (urlParams.get('tab') === 'login') {
        if (authModal) {
            openModal('login');
        }
    }

    // Helper for loading button state
    function setButtonLoading(btn, isLoading, text) {
        if (!btn) return;
        if (isLoading) {
            btn.disabled = true;
            btn.innerHTML = `<i class="ph ph-spinner-gap animate-spin text-lg mr-2"></i> ${text}...`;
            btn.classList.add('opacity-80');
        } else {
            btn.disabled = false;
            btn.innerHTML = text;
            btn.classList.remove('opacity-80');
        }
    }

    // Handle Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalHtml = submitBtn.innerHTML;

            setButtonLoading(submitBtn, true, 'Signing in');

            try {
                const data = await authAPI.login(email, password);
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({
                    name: data.username,
                    email: data.email,
                    avatar: data.avatar || null
                }));

                if (data.preferences) {
                    if (data.preferences.currency) localStorage.setItem('currency', data.preferences.currency);
                    if (data.preferences.appLanguage) localStorage.setItem('language', data.preferences.appLanguage);
                    if (data.preferences.budgetLimit) localStorage.setItem('monthly_budget', data.preferences.budgetLimit);
                }

                if (app && app.notifications) {
                    app.notifications.success('Login successful! Redirecting...');
                }

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } catch (error) {
                if (app && app.notifications) {
                    app.notifications.error(error.message || 'Login failed. Please check your credentials.');
                }
                setButtonLoading(submitBtn, false, originalHtml);
            }
        });
    }

    // --- Validation Logic for Registration ---
    const regName = document.getElementById('register-name');
    const regEmail = document.getElementById('register-email');
    const regPwd = document.getElementById('register-password');
    const regConfPwd = document.getElementById('register-confirm-password');
    const regSubmitBtn = document.getElementById('register-submit-btn');

    const nameFb = document.getElementById('register-name-feedback');
    const emailFb = document.getElementById('register-email-feedback');
    const confPwdFb = document.getElementById('register-confirm-password-feedback');

    const pwdStrength = document.getElementById('password-strength-container');
    const sBar = document.getElementById('strength-bar');
    const sText = document.getElementById('strength-text');

    const reqLength = document.getElementById('req-length');
    const reqUpper = document.getElementById('req-upper');
    const reqLower = document.getElementById('req-lower');
    const reqNumber = document.getElementById('req-number');
    const reqSpecial = document.getElementById('req-special');

    const formState = {
        name: false,
        email: false,
        password: false,
        confirmPassword: false
    };

    function updateSubmitButton() {
        if (!regSubmitBtn) return;
        const isValid = formState.name && formState.email && formState.password && formState.confirmPassword;
        regSubmitBtn.disabled = !isValid;
    }

    function setValidationUI(input, feedbackEl, isValid, message) {
        if (!input || !feedbackEl) return;
        feedbackEl.classList.remove('hidden');
        feedbackEl.textContent = message;

        if (isValid) {
            input.classList.remove('!border-red-500', 'focus:!ring-red-500/20');
            input.classList.add('!border-emerald-500', 'focus:!ring-emerald-500/20');
            feedbackEl.classList.remove('text-red-500');
            feedbackEl.classList.add('text-emerald-600');
        } else {
            input.classList.remove('!border-emerald-500', 'focus:!ring-emerald-500/20');
            input.classList.add('!border-red-500', 'focus:!ring-red-500/20');
            feedbackEl.classList.remove('text-emerald-600');
            feedbackEl.classList.add('text-red-500');
        }
    }

    if (regName && nameFb) {
        regName.addEventListener('input', () => {
            const val = regName.value.trim();
            if (val.length === 0) {
                setValidationUI(regName, nameFb, false, "Name cannot be empty");
                formState.name = false;
            } else if (val.length < 3) {
                setValidationUI(regName, nameFb, false, "Name must contain at least 3 characters");
                formState.name = false;
            } else if (!/^[A-Za-z\s]+$/.test(val)) {
                setValidationUI(regName, nameFb, false, "Only letters and spaces are allowed");
                formState.name = false;
            } else {
                setValidationUI(regName, nameFb, true, "Valid name");
                formState.name = true;
            }
            updateSubmitButton();
        });
    }

    if (regEmail && emailFb) {
        let emailTimer;
        regEmail.addEventListener('input', () => {
            clearTimeout(emailTimer);
            const val = regEmail.value.trim();
            formState.email = false;
            updateSubmitButton();

            if (val.length === 0) {
                setValidationUI(regEmail, emailFb, false, "Email cannot be empty");
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(val)) {
                setValidationUI(regEmail, emailFb, false, "Invalid email format");
                return;
            }

            setValidationUI(regEmail, emailFb, true, "Checking availability...");
            emailFb.classList.replace('text-emerald-600', 'text-slate-500');
            regEmail.classList.remove('!border-emerald-500', '!border-red-500');

            emailTimer = setTimeout(async () => {
                try {
                    const res = await authAPI.checkEmail(val);
                    if (res.available) {
                        setValidationUI(regEmail, emailFb, true, "Email available");
                        formState.email = true;
                    } else {
                        setValidationUI(regEmail, emailFb, false, "Email already registered");
                        formState.email = false;
                    }
                } catch (err) {
                    setValidationUI(regEmail, emailFb, false, "Error checking email");
                    formState.email = false;
                }
                updateSubmitButton();
            }, 500);
        });
    }

    function updateReqUI(el, isValid) {
        if (!el) return;
        if (isValid) {
            el.classList.remove('text-slate-500', 'text-red-500');
            el.classList.add('text-emerald-600');
            el.innerHTML = '<i class="ph ph-check font-bold"></i> ' + el.innerText.trim();
        } else {
            el.classList.remove('text-emerald-600', 'text-slate-500');
            el.classList.add('text-slate-500');
            el.innerHTML = '<i class="ph ph-x font-bold"></i> ' + el.innerText.trim();
        }
    }

    if (regPwd && pwdStrength) {
        regPwd.addEventListener('input', () => {
            const val = regPwd.value;
            if (val.length > 0) {
                pwdStrength.classList.remove('hidden');
            } else {
                pwdStrength.classList.add('hidden');
                formState.password = false;
                updateSubmitButton();
                return;
            }

            const checks = {
                length: val.length >= 8,
                upper: /[A-Z]/.test(val),
                lower: /[a-z]/.test(val),
                number: /[0-9]/.test(val),
                special: /[^A-Za-z0-9]/.test(val)
            };

            updateReqUI(reqLength, checks.length);
            updateReqUI(reqUpper, checks.upper);
            updateReqUI(reqLower, checks.lower);
            updateReqUI(reqNumber, checks.number);
            updateReqUI(reqSpecial, checks.special);

            const score = Object.values(checks).filter(Boolean).length;

            if (sBar && sText) {
                sBar.className = 'h-full transition-all duration-300';
                sText.className = 'text-[10px] font-bold';

                if (score <= 2) {
                    sBar.classList.add('bg-red-500', 'w-1/4');
                    sText.classList.add('text-red-500');
                    sText.textContent = 'Weak';
                    formState.password = false;
                    regPwd.classList.add('!border-red-500');
                    regPwd.classList.remove('!border-emerald-500', '!border-yellow-500');
                } else if (score === 3 || score === 4) {
                    sBar.classList.add('bg-yellow-500', score === 3 ? 'w-2/4' : 'w-3/4');
                    sText.classList.add('text-yellow-500');
                    sText.textContent = 'Medium';
                    formState.password = false;
                    regPwd.classList.add('!border-yellow-500');
                    regPwd.classList.remove('!border-emerald-500', '!border-red-500');
                } else if (score === 5) {
                    sBar.classList.add('bg-emerald-500', 'w-full');
                    sText.classList.add('text-emerald-500');
                    sText.textContent = 'Strong';
                    formState.password = true;
                    regPwd.classList.add('!border-emerald-500');
                    regPwd.classList.remove('!border-yellow-500', '!border-red-500');
                }
            }

            if (regConfPwd && regConfPwd.value.length > 0) {
                regConfPwd.dispatchEvent(new Event('input'));
            }

            updateSubmitButton();
        });
    }

    if (regConfPwd && confPwdFb) {
        regConfPwd.addEventListener('input', () => {
            const val = regConfPwd.value;
            if (val.length === 0) {
                setValidationUI(regConfPwd, confPwdFb, false, "Confirm password cannot be empty");
                formState.confirmPassword = false;
            } else if (val !== regPwd.value) {
                setValidationUI(regConfPwd, confPwdFb, false, "Passwords do not match");
                formState.confirmPassword = false;
            } else {
                setValidationUI(regConfPwd, confPwdFb, true, "Passwords match");
                formState.confirmPassword = true;
            }
            updateSubmitButton();
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;

            const submitBtn = document.getElementById('register-submit-btn');
            const originalHtml = submitBtn ? submitBtn.innerHTML : 'Create Account';

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<i class="ph ph-spinner-gap animate-spin text-lg mr-2"></i> Creating Account...`;
                submitBtn.classList.add('opacity-80');
            }

            try {
                const data = await authAPI.register(name, email, password);
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({ name, email }));

                if (data.preferences) {
                    if (data.preferences.currency) localStorage.setItem('currency', data.preferences.currency);
                    if (data.preferences.appLanguage) localStorage.setItem('language', data.preferences.appLanguage);
                    if (data.preferences.budgetLimit) localStorage.setItem('monthly_budget', data.preferences.budgetLimit);
                }

                if (app && app.notifications) {
                    app.notifications.success('Account created successfully! Welcome to Smart Kharcha!');
                }

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } catch (error) {
                if (app && app.notifications) {
                    app.notifications.error(error.message || 'Registration failed. Try again.');
                }
                setButtonLoading(submitBtn, false, originalHtml);
            }
        });
    }
});
