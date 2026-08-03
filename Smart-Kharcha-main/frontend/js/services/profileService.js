import { apiCall } from './api.js';

export const userAPI = {
    getProfile: () => apiCall('/users/profile'),
    updateProfile: (userData) => apiCall('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(userData)
    })
};
