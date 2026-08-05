export const getCurrencySymbol = () => localStorage.getItem('currency') || '₹';

export const updateCurrencyDisplay = () => {
    const symbol = getCurrencySymbol();
    document.querySelectorAll('.currency-symbol').forEach(el => {
        el.textContent = symbol;
    });
};

export const formatCurrency = (amount) => {
    return Number(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
};
