import { apiCall } from './api.js';

export const userAPI = {
    getProfile: () => apiCall('/users/profile'),
    updateProfile: (userData) => apiCall('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(userData)
    }),
    uploadAvatar: async (formData) => {
        const token = localStorage.getItem('token');
        const apiBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://localhost:5000/api'
            : `${window.location.origin}/api`;
        const response = await fetch(`${apiBase}/users/avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to upload avatar');
        }
        return data;
    },
    logoutAll: () => apiCall('/users/logout-all', {
        method: 'POST'
    }),
    deleteAccount: () => apiCall('/users/profile', {
        method: 'DELETE'
    })
};
