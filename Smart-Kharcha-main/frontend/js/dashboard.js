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

    // Handle Logout for both desktop and mobile buttons
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    });

    // Mobile Navbar toggle
    const navToggle = document.getElementById('mobile-nav-toggle');
    const navMenu = document.getElementById('mobile-nav-menu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('hidden');
        });
    }

    // Global Preferences: Currency Display Update
    const getCurrencySymbol = () => localStorage.getItem('currency') || '₹';
    
    const updateCurrencyDisplay = () => {
        const symbol = getCurrencySymbol();
        document.querySelectorAll('.currency-symbol').forEach(el => {
            el.textContent = symbol;
        });
    };

    // Format currency based on current system
    const formatCurrency = (amount) => {
        return Number(amount).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // Format date nicely
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    };

    // Global state
    let transactions = [];
    let activeAddType = 'expense'; // expense or income
    let categoryChartInstance = null;
    let trendChartInstance = null;

    // Set today's date in picker
    const datePicker = document.getElementById('expense-date');
    if (datePicker) {
        datePicker.valueAsDate = new Date();
    }

    // Form Toggle Expense/Income Type
    const typeExpenseBtn = document.getElementById('type-expense-btn');
    const typeIncomeBtn = document.getElementById('type-income-btn');
    
    if (typeExpenseBtn && typeIncomeBtn) {
        typeExpenseBtn.addEventListener('click', () => {
            activeAddType = 'expense';
            typeExpenseBtn.className = 'py-2 text-xs font-bold rounded-lg text-slate-700 bg-white shadow-sm transition-all focus:outline-none';
            typeIncomeBtn.className = 'py-2 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-700 transition-all focus:outline-none';
            
            // Set default category for expense
            document.getElementById('expense-category').value = 'Food';
        });

        typeIncomeBtn.addEventListener('click', () => {
            activeAddType = 'income';
            typeIncomeBtn.className = 'py-2 text-xs font-bold rounded-lg text-slate-700 bg-white shadow-sm transition-all focus:outline-none';
            typeExpenseBtn.className = 'py-2 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-700 transition-all focus:outline-none';
            
            // Set default category for income
            document.getElementById('expense-category').value = 'Salary';
        });
    }

    // Element references
    const transactionsList = document.getElementById('transactions-list');
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpenseEl = document.getElementById('total-expense');
    const netBalanceEl = document.getElementById('net-balance');
    const searchInput = document.getElementById('search-input');
    const filterCategory = document.getElementById('filter-category');
    const sortSelector = document.getElementById('sort-selector');

    // Toast Notifications System
    function showToast(message, type = 'error') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm transform translate-y-2 opacity-0 transition-all duration-300 pointer-events-auto min-w-[280px]';
        
        if (type === 'success') {
            toast.classList.add('bg-emerald-500', 'shadow-emerald-500/20');
            toast.innerHTML = `<i class="ph-fill ph-check-circle text-xl"></i><span class="font-medium">${message}</span>`;
        } else if (type === 'warning') {
            toast.classList.add('bg-amber-500', 'shadow-amber-500/20');
            toast.innerHTML = `<i class="ph-fill ph-warning text-xl"></i><span class="font-medium">${message}</span>`;
        } else {
            toast.classList.add('bg-rose-500', 'shadow-rose-500/20');
            toast.innerHTML = `<i class="ph-fill ph-x-circle text-xl"></i><span class="font-medium">${message}</span>`;
        }
        
        container.appendChild(toast);
        setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
        
        setTimeout(() => {
            toast.classList.add('translate-y-2', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Category mapping icons and color pills
    const getCategoryIcon = (category) => {
        const icons = {
            'Food': 'ph-hamburger',
            'Transport': 'ph-car',
            'Shopping': 'ph-shopping-bag',
            'Bills': 'ph-receipt',
            'Entertainment': 'ph-film-strip',
            'Salary': 'ph-briefcase-metal',
            'Investment': 'ph-trend-up',
            'Other': 'ph-dots-three-circle'
        };
        return icons[category] || 'ph-currency-inr';
    };

    const getCategoryColor = (category, type) => {
        if (type === 'income') {
            return 'bg-emerald-100 text-emerald-600';
        }
        const colors = {
            'Food': 'bg-orange-100 text-orange-600',
            'Transport': 'bg-blue-100 text-blue-600',
            'Shopping': 'bg-purple-100 text-purple-600',
            'Bills': 'bg-rose-100 text-rose-600',
            'Entertainment': 'bg-pink-100 text-pink-600',
            'Other': 'bg-slate-100 text-slate-600'
        };
        return colors[category] || 'bg-slate-100 text-slate-600';
    };

    // Calculate budget limits, update UI progress bar
    const updateBudgetWidget = (totalMonthlyExpenses) => {
        const budgetLimit = Number(localStorage.getItem('monthly_budget') || '10000');
        const budgetPercentage = budgetLimit > 0 ? Math.min((totalMonthlyExpenses / budgetLimit) * 100, 100) : 0;
        
        const progressBar = document.getElementById('budget-progress-bar');
        const percentageText = document.getElementById('budget-percentage');
        const spentValEl = document.getElementById('budget-spent-val');
        const limitValEl = document.getElementById('budget-limit-val');
        const quickStatusEl = document.getElementById('budget-quick-status');

        if (percentageText) percentageText.textContent = `${Math.round(budgetPercentage)}% Used`;
        if (spentValEl) spentValEl.textContent = formatCurrency(totalMonthlyExpenses);
        if (limitValEl) limitValEl.textContent = formatCurrency(budgetLimit);

        if (progressBar) {
            progressBar.style.width = `${budgetPercentage}%`;
            // Color updates
            progressBar.className = 'h-full rounded-full transition-all duration-500';
            if (budgetPercentage >= 100) {
                progressBar.classList.add('bg-danger');
                if (quickStatusEl) {
                    quickStatusEl.textContent = 'Exceeded!';
                    quickStatusEl.className = 'text-xs font-bold text-danger';
                }

                // Show Budget Exceeded Warning Popup Modal
                if (budgetLimit > 0 && totalMonthlyExpenses > budgetLimit) {
                    const lastWarnedAmount = sessionStorage.getItem('budget_warning_amount');
                    if (!lastWarnedAmount || Number(lastWarnedAmount) < totalMonthlyExpenses) {
                        const warningModal = document.getElementById('budget-warning-modal');
                        const warningSpentVal = document.getElementById('warning-spent-val');
                        const warningLimitVal = document.getElementById('warning-limit-val');
                        if (warningModal && warningSpentVal && warningLimitVal) {
                            warningSpentVal.textContent = formatCurrency(totalMonthlyExpenses);
                            warningLimitVal.textContent = formatCurrency(budgetLimit);
                            
                            warningModal.classList.remove('hidden');
                            setTimeout(() => {
                                warningModal.classList.remove('opacity-0');
                                warningModal.querySelector('div').classList.remove('scale-95');
                            }, 10);
                            
                            sessionStorage.setItem('budget_warning_amount', totalMonthlyExpenses.toString());
                        }
                    }
                }
            } else if (budgetPercentage >= 80) {
                progressBar.classList.add('bg-accent');
                if (quickStatusEl) {
                    quickStatusEl.textContent = 'Approaching Limit';
                    quickStatusEl.className = 'text-xs font-bold text-accent';
                }
            } else {
                progressBar.classList.add('bg-secondary');
                const remaining = budgetLimit - totalMonthlyExpenses;
                if (quickStatusEl) {
                    quickStatusEl.textContent = `${getCurrencySymbol()}${formatCurrency(remaining)} left`;
                    quickStatusEl.className = 'text-xs font-semibold text-slate-700';
                }
            }
        }
    };

    // Update Analytics Charts
    const renderCharts = () => {
        const currencySymbol = getCurrencySymbol();
        
        // 1. Prepare Category Doughnut Data (Expenses only)
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        const categoryData = {};
        
        expenseTransactions.forEach(t => {
            const cat = t.category || 'Other';
            categoryData[cat] = (categoryData[cat] || 0) + Number(t.amount);
        });

        const categoryLabels = Object.keys(categoryData);
        const categoryValues = Object.values(categoryData);

        const doughnutCtx = document.getElementById('categoryChart');
        if (doughnutCtx) {
            if (categoryChartInstance) {
                categoryChartInstance.destroy();
            }

            if (categoryLabels.length === 0) {
                // Draw empty chart warning in console, let canvas show blank
                categoryChartInstance = null;
            } else {
                categoryChartInstance = new Chart(doughnutCtx, {
                    type: 'doughnut',
                    data: {
                        labels: categoryLabels,
                        datasets: [{
                            data: categoryValues,
                            backgroundColor: [
                                '#f97316', // Food
                                '#3b82f6', // Transport
                                '#a855f7', // Shopping
                                '#f43f5e', // Bills
                                '#ec4899', // Entertainment
                                '#64748b'  // Other
                            ],
                            borderWidth: 2,
                            borderColor: '#ffffff'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    boxWidth: 10,
                                    font: { size: 11, family: 'Plus Jakarta Sans' },
                                    padding: 10
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return ` ${context.label}: ${currencySymbol}${formatCurrency(context.raw)}`;
                                    }
                                }
                            }
                        },
                        cutout: '65%'
                    }
                });
            }
        }

        // 2. Prepare Trend Chart Data (Last 15 days expenses)
        const trendData = {};
        const today = new Date();
        
        // Initialize last 15 days keys
        for (let i = 14; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            trendData[dateStr] = 0;
        }

        // Sum expenses on these days
        expenseTransactions.forEach(t => {
            const dateKey = new Date(t.date).toISOString().split('T')[0];
            if (trendData[dateKey] !== undefined) {
                trendData[dateKey] += Number(t.amount);
            }
        });

        const trendLabels = Object.keys(trendData).map(dStr => {
            const parts = dStr.split('-');
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${parts[2]} ${months[parseInt(parts[1]) - 1]}`;
        });
        const trendValues = Object.values(trendData);

        const trendCtx = document.getElementById('trendChart');
        if (trendCtx) {
            if (trendChartInstance) {
                trendChartInstance.destroy();
            }

            trendChartInstance = new Chart(trendCtx, {
                type: 'bar',
                data: {
                    labels: trendLabels,
                    datasets: [{
                        label: 'Daily Expenses',
                        data: trendValues,
                        backgroundColor: 'rgba(99, 102, 241, 0.85)',
                        borderColor: '#6366f1',
                        borderWidth: 0,
                        borderRadius: 6,
                        barPercentage: 0.6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: '#f1f5f9' },
                            ticks: {
                                font: { size: 9, family: 'Plus Jakarta Sans' },
                                callback: function(value) {
                                    return currencySymbol + value;
                                }
                            }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { font: { size: 9, family: 'Plus Jakarta Sans' } }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return ` Spent: ${currencySymbol}${formatCurrency(context.raw)}`;
                                }
                            }
                        }
                    }
                }
            });
        }
    };

    // Filter, Sort, & Render Transactions list
    const filterAndRenderTransactions = () => {
        let filtered = [...transactions];
        
        // Search Filter
        const query = searchInput.value.toLowerCase().trim();
        if (query) {
            filtered = filtered.filter(t => t.title.toLowerCase().includes(query));
        }

        // Category Filter
        const categoryVal = filterCategory.value;
        if (categoryVal !== 'all') {
            filtered = filtered.filter(t => t.category === categoryVal);
        }

        // Sort Selector
        const sortVal = sortSelector.value;
        if (sortVal === 'date-desc') {
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (sortVal === 'date-asc') {
            filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (sortVal === 'amount-desc') {
            filtered.sort((a, b) => Number(b.amount) - Number(a.amount));
        } else if (sortVal === 'amount-asc') {
            filtered.sort((a, b) => Number(a.amount) - Number(b.amount));
        }

        renderTransactionsList(filtered);
    };

    // Render helper
    const renderTransactionsList = (list) => {
        transactionsList.innerHTML = '';
        const currencySymbol = getCurrencySymbol();

        if (list.length === 0) {
            transactionsList.innerHTML = `
                <div class="text-center py-16 text-slate-400">
                    <div class="text-5xl mb-3 text-slate-300"><i class="ph ph-ghost"></i></div>
                    <p class="text-sm font-medium">No transactions match your search/filters.</p>
                </div>
            `;
            return;
        }

        list.forEach(t => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-shadow group';
            
            const isExpense = t.type === 'expense';
            const iconClass = getCategoryIcon(t.category);
            const colorClass = getCategoryColor(t.category, t.type);
            const amountPrefix = isExpense ? '-' : '+';
            const amountColor = isExpense ? 'text-slate-800' : 'text-emerald-600';
            
            item.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center ${colorClass} shadow-inner">
                        <i class="ph ${iconClass} text-2xl"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-slate-800 text-sm md:text-base">${t.title}</h4>
                        <p class="text-[11px] text-slate-400 font-semibold mt-0.5">${formatDate(t.date)} • ${t.category || 'General'}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="font-extrabold font-heading text-sm md:text-base ${amountColor}">${amountPrefix}${currencySymbol}${formatCurrency(t.amount)}</span>
                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="edit-btn p-1.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-all" data-id="${t._id}">
                            <i class="ph ph-pencil-simple text-lg"></i>
                        </button>
                        <button class="delete-btn p-1.5 text-slate-400 hover:text-danger hover:bg-slate-50 rounded-lg transition-all" data-id="${t._id}">
                            <i class="ph ph-trash text-lg"></i>
                        </button>
                    </div>
                </div>
            `;
            transactionsList.appendChild(item);
        });

        // Attach edit button click listeners
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const t = transactions.find(item => item._id === id);
                if (t) {
                    openEditModal(t);
                }
            });
        });

        // Attach delete button click listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                if (confirm('Delete this transaction permanently?')) {
                    try {
                        await transactionAPI.delete(id);
                        showToast('Transaction deleted successfully', 'success');
                        fetchTransactions(); // Refresh
                    } catch (error) {
                        showToast('Error deleting transaction');
                    }
                }
            });
        });
    };

    // Calculate aggregated stats (Net, Income, Expense, Budget)
    const calculateFinancialStats = () => {
        let totalIncome = 0;
        let totalExpense = 0;
        const now = new Date();
        let currentMonthExpenses = 0;

        transactions.forEach(t => {
            const amt = Number(t.amount);
            if (t.type === 'income') {
                totalIncome += amt;
            } else {
                totalExpense += amt;
                
                // Track current month expenses for budget progress
                const tDate = new Date(t.date);
                if (tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear()) {
                    currentMonthExpenses += amt;
                }
            }
        });

        const netBalance = totalIncome - totalExpense;

        // Render card content
        totalIncomeEl.textContent = formatCurrency(totalIncome);
        totalExpenseEl.textContent = formatCurrency(totalExpense);
        
        if (netBalance >= 0) {
            netBalanceEl.textContent = formatCurrency(netBalance);
            netBalanceEl.parentElement.parentElement.className = 'bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-5 md:p-6 text-white shadow-lg relative overflow-hidden';
        } else {
            // Negative balance style adjustments
            netBalanceEl.textContent = `(${formatCurrency(Math.abs(netBalance))})`;
            netBalanceEl.parentElement.parentElement.className = 'bg-gradient-to-br from-rose-600 to-rose-800 rounded-2xl p-5 md:p-6 text-white shadow-lg relative overflow-hidden';
        }

        // Exposing current month name on UI
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const expensesMonthIndicator = document.getElementById('expenses-month-indicator');
        if (expensesMonthIndicator) {
            expensesMonthIndicator.textContent = `Spent in ${monthNames[now.getMonth()]}`;
        }

        // Budget Widget updates
        updateBudgetWidget(currentMonthExpenses);
    };

    // Main fetch loop
    const fetchTransactions = async () => {
        try {
            const data = await transactionAPI.getAll();
            transactions = data.transactions || data || [];
            
            // Sort standard order: date desc
            transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Compute card displays
            calculateFinancialStats();
            
            // Render list
            filterAndRenderTransactions();
            
            // Draw Charts
            renderCharts();
            
            // Preferences updates
            updateCurrencyDisplay();
        } catch (error) {
            console.error('Error fetching transactions:', error);
            showToast('Failed to connect to ledger service');
            transactionsList.innerHTML = `
                <div class="text-center py-16 text-rose-500">
                    <i class="ph ph-warning-circle text-3xl mb-2"></i>
                    <p class="text-sm font-semibold">Connection failed. Check local backend status.</p>
                </div>
            `;
        }
    };

    // Add New Transaction form submission
    document.getElementById('add-expense-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const amount = document.getElementById('expense-amount').value;
        const category = document.getElementById('expense-category').value;
        const date = document.getElementById('expense-date').value;
        const title = document.getElementById('expense-desc').value;

        const submitBtn = document.getElementById('add-transaction-submit');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = `<i class="ph ph-spinner-gap animate-spin text-base"></i> Adding...`;
        submitBtn.disabled = true;

        try {
            await transactionAPI.add({
                title,
                amount: Number(amount),
                category,
                date,
                type: activeAddType
            });
            
            showToast('Transaction added successfully', 'success');

            // Reset form fields
            document.getElementById('expense-amount').value = '';
            document.getElementById('expense-desc').value = '';
            datePicker.valueAsDate = new Date();
            
            // Reload dashboard
            await fetchTransactions();
        } catch (error) {
            showToast('Failed to add transaction: ' + error.message);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // Budget Adjustment Modals Logic
    const budgetModal = document.getElementById('budget-modal');
    const adjustBudgetBtn = document.getElementById('adjust-budget-btn');
    const closeBudgetBtn = document.getElementById('close-budget-btn');
    const budgetForm = document.getElementById('budget-settings-form');
    const inputBudgetLimit = document.getElementById('input-budget-limit');

    const openBudgetModal = () => {
        const currentLimit = localStorage.getItem('monthly_budget') || '10000';
        inputBudgetLimit.value = currentLimit;
        budgetModal.classList.remove('hidden');
        setTimeout(() => {
            budgetModal.classList.remove('opacity-0');
            budgetModal.querySelector('.transform').classList.remove('scale-95');
        }, 10);
    };

    const closeBudgetModal = () => {
        budgetModal.classList.add('opacity-0');
        budgetModal.querySelector('.transform').classList.add('scale-95');
        setTimeout(() => {
            budgetModal.classList.add('hidden');
        }, 300);
    };

    if (adjustBudgetBtn) adjustBudgetBtn.addEventListener('click', openBudgetModal);
    if (closeBudgetBtn) closeBudgetBtn.addEventListener('click', closeBudgetModal);
    
    budgetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const limitVal = inputBudgetLimit.value;
        localStorage.setItem('monthly_budget', limitVal);
        showToast('Budget limit saved successfully', 'success');
        closeBudgetModal();
        
        // Refresh calculations
        calculateFinancialStats();
        updateCurrencyDisplay();
    });

    // Edit Transaction Modals Logic
    const editModal = document.getElementById('edit-modal');
    const closeEditBtn = document.getElementById('close-edit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const editForm = document.getElementById('edit-transaction-form');

    const openEditModal = (t) => {
        document.getElementById('edit-transaction-id').value = t._id;
        document.getElementById('edit-transaction-type').value = t.type;
        document.getElementById('edit-transaction-amount').value = t.amount;
        document.getElementById('edit-transaction-category').value = t.category;
        document.getElementById('edit-transaction-desc').value = t.title;
        
        // Form date mapping (extract YYYY-MM-DD)
        if (t.date) {
            document.getElementById('edit-transaction-date').value = new Date(t.date).toISOString().split('T')[0];
        }

        editModal.classList.remove('hidden');
        setTimeout(() => {
            editModal.classList.remove('opacity-0');
            editModal.querySelector('.transform').classList.remove('scale-95');
        }, 10);
    };

    const closeEditModal = () => {
        editModal.classList.add('opacity-0');
        editModal.querySelector('.transform').classList.add('scale-95');
        setTimeout(() => {
            editModal.classList.add('hidden');
        }, 300);
    };

    if (closeEditBtn) closeEditBtn.addEventListener('click', closeEditModal);
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('edit-transaction-id').value;
        const type = document.getElementById('edit-transaction-type').value;
        const amount = document.getElementById('edit-transaction-amount').value;
        const category = document.getElementById('edit-transaction-category').value;
        const title = document.getElementById('edit-transaction-desc').value;
        const date = document.getElementById('edit-transaction-date').value;

        const saveBtn = editForm.querySelector('button[type="submit"]');
        const origText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        try {
            await transactionAPI.update(id, {
                title,
                amount: Number(amount),
                type,
                category,
                date
            });
            showToast('Transaction updated successfully', 'success');
            closeEditModal();
            fetchTransactions(); // Refresh
        } catch (error) {
            showToast('Failed to update: ' + error.message);
        } finally {
            saveBtn.textContent = origText;
            saveBtn.disabled = false;
        }
    });

    // Budget Warning Modal dismiss / adjust handlers
    const warningModal = document.getElementById('budget-warning-modal');
    const closeWarningBtn = document.getElementById('close-warning-btn');
    const warningAdjustBtn = document.getElementById('warning-adjust-btn');

    if (warningModal && closeWarningBtn && warningAdjustBtn) {
        const closeWarning = () => {
            warningModal.classList.add('opacity-0');
            warningModal.querySelector('div').classList.add('scale-95');
            setTimeout(() => {
                warningModal.classList.add('hidden');
            }, 300);
        };
        closeWarningBtn.addEventListener('click', closeWarning);
        
        warningAdjustBtn.addEventListener('click', () => {
            closeWarning();
            // Open standard budget modal
            const budgetModal = document.getElementById('budget-modal');
            const inputBudgetLimit = document.getElementById('input-budget-limit');
            if (budgetModal && inputBudgetLimit) {
                const currentBudget = localStorage.getItem('monthly_budget') || '10000';
                inputBudgetLimit.value = currentBudget;
                budgetModal.classList.remove('hidden');
                setTimeout(() => {
                    budgetModal.classList.remove('opacity-0');
                    budgetModal.querySelector('div').classList.remove('scale-95');
                }, 10);
            }
        });
    }

    // Filtering inputs listeners
    if (searchInput) searchInput.addEventListener('input', filterAndRenderTransactions);
    if (filterCategory) filterCategory.addEventListener('change', filterAndRenderTransactions);
    if (sortSelector) sortSelector.addEventListener('change', filterAndRenderTransactions);

    // Initial Loading trigger
    fetchTransactions();
});
