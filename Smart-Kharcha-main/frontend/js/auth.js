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

    // Elegant Toast Notification System
    function showToast(message, type = 'error') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm transform translate-y-2 opacity-0 transition-all duration-300 pointer-events-auto min-w-[280px]';
        
        if (type === 'success') {
            toast.classList.add('bg-emerald-500', 'shadow-emerald-500/20');
            toast.innerHTML = `<i class="ph-fill ph-check-circle text-xl"></i><span class="font-medium">${message}</span>`;
        } else if (type === 'warning') {
            toast.classList.add('bg-amber-500', 'shadow-amber-500/20');
            toast.innerHTML = `<i class="ph-fill ph-warning text-xl"></i><span class="font-medium">${message}</span>`;
        } else {
            toast.classList.add('bg-rose-500', 'shadow-rose-500/20');
            toast.innerHTML = `<i class="ph-fill ph-x-circle text-xl"></i><span class="font-medium">${message}</span>`;
        }
        
        container.appendChild(toast);
        
        // Trigger reflow & animate in
        setTimeout(() => {
            toast.classList.remove('translate-y-2', 'opacity-0');
        }, 10);
        
        // Animate out & remove
        setTimeout(() => {
            toast.classList.add('translate-y-2', 'opacity-0');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 4000);
    }

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
            
            showToast('Sign in successful! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } catch (error) {
            showToast(error.message || 'Invalid email or password');
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
            
            showToast('Account created successfully! Welcome onboard.', 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1200);
        } catch (error) {
            showToast(error.message || 'Registration failed. Try again.');
            setButtonLoading(submitBtn, false, originalHtml);
        }
    });
});
