import { authAPI } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    if (localStorage.getItem('token')) {
        window.location.href = 'dashboard.html';
        return;
    }

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');
    const errorDiv = document.getElementById('error-message');

    // Toggle forms
    showRegisterBtn.addEventListener('click', () => {
        loginForm.classList.add('hidden-form');
        registerForm.classList.remove('hidden-form');
        errorDiv.classList.add('hidden');
    });

    showLoginBtn.addEventListener('click', () => {
        registerForm.classList.add('hidden-form');
        loginForm.classList.remove('hidden-form');
        errorDiv.classList.add('hidden');
    });

    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }

    // Handle Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const data = await authAPI.login(email, password);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user || { name: 'User' }));
            window.location.href = 'dashboard.html';
        } catch (error) {
            showError(error.message);
        }
    });

    // Handle Register
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        try {
            const data = await authAPI.register(name, email, password);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user || { name: name }));
            window.location.href = 'dashboard.html';
        } catch (error) {
            showError(error.message);
        }
    });
});
