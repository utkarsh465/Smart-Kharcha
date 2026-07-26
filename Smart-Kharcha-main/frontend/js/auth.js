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

    // Handle Register
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalHtml = submitBtn.innerHTML;
        setButtonLoading(submitBtn, true, originalHtml);

        try {
            const data = await authAPI.register(name, email, password);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user || { name: name, email: email }));
            
            app.notifications.success('Account created successfully! Welcome onboard.');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1200);
        } catch (error) {
            app.notifications.error(error.message || 'Registration failed. Try again.');
            setButtonLoading(submitBtn, false, originalHtml);
        }
    });
});

