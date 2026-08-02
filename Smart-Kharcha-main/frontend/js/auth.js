import app from './app/app.js';
import { authAPI } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    if (localStorage.getItem('token')) {
        window.location.href = 'dashboard.html';
        return;
    }

    const loginFormContainer = document.getElementById('login-form-container');
    const registerFormContainer = document.getElementById('register-form-container');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');

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

    // Notifications now handled by NotificationManager

    // Toggle forms with smooth fade
    showRegisterBtn.addEventListener('click', () => {
        loginFormContainer.classList.add('hidden-form');
        setTimeout(() => {
            registerFormContainer.classList.remove('hidden-form');
        }, 150);
    });

    showLoginBtn.addEventListener('click', () => {
        registerFormContainer.classList.add('hidden-form');
        setTimeout(() => {
            loginFormContainer.classList.remove('hidden-form');
        }, 150);
    });

    // Helper to toggle button loading state
    function setButtonLoading(button, isLoading, originalHtml) {
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = `<i class="ph ph-spinner-gap animate-spin text-lg mr-2"></i> Loading...`;
            button.classList.add('opacity-80');
        } else {
            button.disabled = false;
            button.innerHTML = originalHtml;
            button.classList.remove('opacity-80');
        }
    }

    // Handle Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalHtml = submitBtn.innerHTML;
        setButtonLoading(submitBtn, true, originalHtml);

        try {
            const data = await authAPI.login(email, password);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user || { name: 'User', email: email }));
            
            app.notifications.success('Sign in successful! Redirecting...');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } catch (error) {
            app.notifications.error(error.message || 'Invalid email or password');
            setButtonLoading(submitBtn, false, originalHtml);
        }
    });

    // --- Real-time Validation Logic ---
    const formState = { name: false, email: false, password: false, confirmPassword: false };
    
    const regName = document.getElementById('register-name');
    const nameFb = document.getElementById('register-name-feedback');
    
    const regEmail = document.getElementById('register-email');
    const emailFb = document.getElementById('register-email-feedback');
    
    const regPwd = document.getElementById('register-password');
    const pwdStrength = document.getElementById('password-strength-container');
    const sBar = document.getElementById('strength-bar');
    const sText = document.getElementById('strength-text');
    
    const reqLength = document.getElementById('req-length');
    const reqUpper = document.getElementById('req-upper');
    const reqLower = document.getElementById('req-lower');
    const reqNumber = document.getElementById('req-number');
    const reqSpecial = document.getElementById('req-special');
    
    const regConfPwd = document.getElementById('register-confirm-password');
    const confPwdFb = document.getElementById('register-confirm-password-feedback');
    
    const regSubmit = document.getElementById('register-submit-btn');

    function updateSubmitButton() {
        if (formState.name && formState.email && formState.password && formState.confirmPassword) {
            regSubmit.disabled = false;
        } else {
            regSubmit.disabled = true;
        }
    }

    function setValidationUI(input, feedbackEl, isValid, message) {
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

    // Name Validation
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

    // Email Validation
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

    // Password Validation
    function updateReqUI(el, isValid) {
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
        
        if (regConfPwd.value.length > 0) {
            regConfPwd.dispatchEvent(new Event('input'));
        }
        
        updateSubmitButton();
    });

    // Confirm Password Validation
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
    // --- End Validation Logic ---

    // Handle Register
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        const submitBtn = document.getElementById('register-submit-btn');
        const originalHtml = submitBtn.innerHTML;
        
        // Add "Creating Account..." loading state text to match requirement
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="ph ph-spinner-gap animate-spin text-lg mr-2"></i> Creating Account...`;
        submitBtn.classList.add('opacity-80');

        try {
            const data = await authAPI.register(name, email, password);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user || { name: name, email: email }));
            
            app.notifications.success('✅ Account Created Successfully. Welcome to Smart Kharcha!');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500); // Wait 1.5 seconds per requirement
        } catch (error) {
            app.notifications.error(error.message || 'Registration failed. Try again.');
            setButtonLoading(submitBtn, false, originalHtml);
        }
    });
});
