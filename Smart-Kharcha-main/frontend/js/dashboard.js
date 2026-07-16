import { transactionAPI, getToken } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (!getToken()) {
        window.location.href = 'index.html';
        return;
    }

    // Set User Name
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            document.getElementById('user-name-display').textContent = user.name || 'User';
        } catch(e) {}
    }

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    // Mobile Menu (Placeholder)
    document.getElementById('mobile-menu-btn').addEventListener('click', () => {
        alert('Mobile menu toggle coming soon!');
    });

    // Set today's date in the date picker
    document.getElementById('expense-date').valueAsDate = new Date();

    const transactionsList = document.getElementById('transactions-list');
    const totalExpenseEl = document.getElementById('total-expense');
    let transactions = [];

    // Format currency
    const formatCurrency = (amount) => {
        return Number(amount).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // Format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    };

    // Category icon mapper
    const getCategoryIcon = (category) => {
        const icons = {
            'Food': 'ph-hamburger',
            'Transport': 'ph-car',
            'Shopping': 'ph-shopping-bag',
            'Bills': 'ph-receipt',
            'Entertainment': 'ph-film-strip',
            'Other': 'ph-dots-three-circle'
        };
        return icons[category] || 'ph-currency-inr';
    };

    const getCategoryColor = (category) => {
        const colors = {
            'Food': 'bg-orange-100 text-orange-600',
            'Transport': 'bg-blue-100 text-blue-600',
            'Shopping': 'bg-purple-100 text-purple-600',
            'Bills': 'bg-red-100 text-red-600',
            'Entertainment': 'bg-pink-100 text-pink-600',
            'Other': 'bg-gray-100 text-gray-600'
        };
        return colors[category] || 'bg-gray-100 text-gray-600';
    };

    // Render Transactions
    const renderTransactions = () => {
        transactionsList.innerHTML = '';
        let total = 0;

        if (transactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="text-center py-10 text-gray-500">
                    <div class="text-5xl mb-3 text-gray-300"><i class="ph-fill ph-ghost"></i></div>
                    <p>No expenses found. Add one to get started!</p>
                </div>
            `;
            totalExpenseEl.textContent = '0.00';
            return;
        }

        transactions.forEach(t => {
            total += Number(t.amount);
            const iconClass = getCategoryIcon(t.category);
            const colorClass = getCategoryColor(t.category);
            
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-shadow group';
            
            item.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center ${colorClass}">
                        <i class="ph ${iconClass} text-2xl"></i>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-800">${t.title}</h4>
                        <p class="text-xs text-gray-500">${formatDate(t.date)} • ${t.category}</p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <span class="font-bold text-gray-800">₹${formatCurrency(t.amount)}</span>
                    <button class="delete-btn text-gray-300 hover:text-danger transition-colors opacity-0 group-hover:opacity-100" data-id="${t._id}">
                        <i class="ph-fill ph-trash text-xl"></i>
                    </button>
                </div>
            `;
            transactionsList.appendChild(item);
        });

        totalExpenseEl.textContent = formatCurrency(total);

        // Attach delete listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this expense?')) {
                    try {
                        await transactionAPI.delete(id);
                        fetchTransactions(); // Refresh
                    } catch (error) {
                        alert('Error deleting transaction');
                    }
                }
            });
        });
    };

    // Fetch Transactions
    const fetchTransactions = async () => {
        try {
            const data = await transactionAPI.getAll();
            transactions = data.transactions || data || [];
            // Sort by date desc
            transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
            renderTransactions();
        } catch (error) {
            console.error('Error fetching transactions:', error);
            transactionsList.innerHTML = `
                <div class="text-center py-10 text-red-500">
                    <i class="ph ph-warning-circle text-3xl mb-2"></i>
                    <p>Failed to load transactions. ${error.message}</p>
                </div>
            `;
        }
    };

    // Add Expense
    document.getElementById('add-expense-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const amount = document.getElementById('expense-amount').value;
        const category = document.getElementById('expense-category').value;
        const date = document.getElementById('expense-date').value;
        const title = document.getElementById('expense-desc').value;

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Adding...';
        submitBtn.disabled = true;

        try {
            await transactionAPI.add({
                title,
                amount: Number(amount),
                category,
                date,
                type: 'expense'
            });
            
            // Reset form except date
            document.getElementById('expense-amount').value = '';
            document.getElementById('expense-desc').value = '';
            
            // Refresh list
            await fetchTransactions();
            
        } catch (error) {
            alert('Failed to add expense: ' + error.message);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // Initial load
    fetchTransactions();
});
