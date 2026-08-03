import { apiCall } from './api.js';

export const userAPI = {
    getProfile: () => apiCall('/users/profile'),
    updateProfile: (userData) => apiCall('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(userData)
    }),
    uploadAvatar: async (formData) => {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/users/avatar', {
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
    }
};
