export const getCategoryIcon = (category) => {
    const icons = {
        'Food': '🍔',
        'Transport': '🚗',
        'Travel': '🚗',
        'Shopping': '🛍',
        'Medical': '💊',
        'Bills': '📄',
        'Salary': '💰',
        'Entertainment': '🎮',
        'Education': '📚',
        'Other': '📌'
    };
    return icons[category] || '📌';
};

export const getCategoryColor = (category) => {
    const colors = {
        'Food': 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
        'Transport': 'bg-blue-50 text-blue-700 border-blue-200/50',
        'Travel': 'bg-blue-50 text-blue-700 border-blue-200/50',
        'Shopping': 'bg-purple-50 text-purple-700 border-purple-200/50',
        'Medical': 'bg-rose-50 text-rose-700 border-rose-200/50',
        'Bills': 'bg-amber-50 text-amber-700 border-amber-200/50',
        'Entertainment': 'bg-pink-50 text-pink-700 border-pink-200/50',
        'Education': 'bg-indigo-50 text-indigo-700 border-indigo-200/50',
        'Other': 'bg-slate-50 text-slate-700 border-slate-200/50'
    };
    return colors[category] || 'bg-slate-50 text-slate-700 border-slate-200/50';
};
