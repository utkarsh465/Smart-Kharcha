const BASE_URL = 'http://localhost:5000/api';

// Helper to get auth token
const getToken = () => localStorage.getItem('token');

// General fetch wrapper
async function apiCall(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth API
const authAPI = {
    login: (email, password) => apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    }),
    register: (name, email, password) => apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
    })
};

// Transactions API
const transactionAPI = {
    getAll: () => apiCall('/transactions'),
    add: (transactionData) => apiCall('/transactions', {
        method: 'POST',
        body: JSON.stringify(transactionData)
    }),
    update: (id, transactionData) => apiCall(`/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(transactionData)
    }),
    delete: (id) => apiCall(`/transactions/${id}`, {
        method: 'DELETE'
    })
};

// User API
const userAPI = {
    getProfile: () => apiCall('/users/profile'),
    updateProfile: (userData) => apiCall('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(userData)
    })
};

export { authAPI, transactionAPI, userAPI, getToken };
