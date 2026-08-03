import { apiCall } from './api.js';

export const authAPI = {
    login: (email, password) => apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    }),
    register: (name, email, password) => apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
    }),
    checkEmail: (email) => apiCall('/auth/check-email', {
        method: 'POST',
        body: JSON.stringify({ email })
    })
};
