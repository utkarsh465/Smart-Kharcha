import { apiCall } from './api.js';

export const transactionAPI = {
    getAll: () => apiCall('/transactions'),
    getAdvanced: (params) => {
        const queryParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                queryParams.append(key, params[key]);
            }
        });
        return apiCall(`/transactions?${queryParams.toString()}`);
    },
    getAnalytics: () => apiCall('/transactions/analytics'),
    getCalendarMonth: (month) => apiCall(`/transactions/calendar?month=${month}`),
    getDashboardMetrics: (budgetLimit) => apiCall(`/transactions/dashboard-metrics?budgetLimit=${budgetLimit}`),
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
    }),
    duplicate: (id) => apiCall(`/transactions/${id}/duplicate`, {
        method: 'POST'
    }),
    pin: (id) => apiCall(`/transactions/${id}/pin`, {
        method: 'PUT'
    })
};
