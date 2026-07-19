import { transactionAPI, getToken } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (!getToken()) {
        window.location.href = 'index.html';
        return;
    }

    // Set User Name and Email
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            document.getElementById('user-name-display').textContent = user.name || 'User';
            const profileAvatar = document.getElementById('profile-avatar');
            if (profileAvatar) {
                profileAvatar.textContent = (user.name || 'U').charAt(0).toUpperCase();
            }
            const dropdownName = document.getElementById('dropdown-user-name');
            const dropdownEmail = document.getElementById('dropdown-user-email');
            if (dropdownName) dropdownName.textContent = user.name || 'User';
            if (dropdownEmail) dropdownEmail.textContent = user.email || 'user@example.com';
        } catch(e) {}
    }

    // Dynamic Time-Based Greeting
    const updateGreeting = () => {
        const hour = new Date().getHours();
        const greetingHeading = document.getElementById('greeting-heading');
        if (!greetingHeading) return;

        let greetingText = '';
        if (hour < 12) {
            greetingText = '🌞 Good Morning';
        } else if (hour < 18) {
            greetingText = '☀ Good Afternoon';
        } else {
            greetingText = '🌙 Good Evening';
        }

        const name = (userStr ? JSON.parse(userStr).name : '') || 'User';
        greetingHeading.innerHTML = `${greetingText}, <span class="text-primary">${name}</span>`;
    };
    updateGreeting();

    // Handle Logout
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    });

    // Dark Mode Toggle placeholder
    const darkModeBtn = document.getElementById('dark-mode-toggle');
    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('dark_mode', isDark);
            showToast(`Theme switched to ${isDark ? 'Dark' : 'Light'} Mode`, 'success');
        });
        if (localStorage.getItem('dark_mode') === 'true') {
            document.documentElement.classList.add('dark');
        }
    }

    // Notificationbell dropdown handler
    const notifBtn = document.getElementById('notification-bell-btn');
    const notifDrawer = document.getElementById('notification-drawer');
    if (notifBtn && notifDrawer) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDrawer.classList.toggle('hidden');
        });
    }

    // Profile dropdown handler
    const profileBtn = document.getElementById('profile-dropdown-btn');
    const profileBox = document.getElementById('profile-dropdown-box');
    if (profileBtn && profileBox) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileBox.classList.toggle('hidden');
        });
    }

    // Click outside lists to close dropdowns
    window.addEventListener('click', () => {
        if (profileBox) profileBox.classList.add('hidden');
        if (notifDrawer) notifDrawer.classList.add('hidden');
    });

    // Currency Settings Helper
    const getCurrencySymbol = () => localStorage.getItem('currency') || '₹';
    const updateCurrencyDisplay = () => {
        const symbol = getCurrencySymbol();
        document.querySelectorAll('.currency-symbol').forEach(el => {
            el.textContent = symbol;
        });
    };

    const formatCurrency = (amount) => {
        return Number(amount).toLocaleString('en-IN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    };

    // Category mapping icons and color pills
    const getCategoryIcon = (category) => {
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

    const getCategoryColor = (category) => {
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

    // Global state
    let transactions = [];
    let currentTrendInterval = 'weekly'; // weekly, monthly, yearly
    let activeCategoryFilter = null; // Filter transactions by chart slice
    let categoryChartInstance = null;
    let trendChartInstance = null;
    let calendarDate = new Date();
    let notifications = [];

    // DOM references
    const transactionsList = document.getElementById('transactions-list');
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpenseEl = document.getElementById('total-expense');
    const netBalanceEl = document.getElementById('net-balance');
    
    const todayExpenseEl = document.getElementById('today-expense-val');
    const todayIncomeEl = document.getElementById('today-income-val');
    const todayTxnsEl = document.getElementById('today-txns-count');

    const healthRing = document.getElementById('health-score-ring');
    const healthVal = document.getElementById('health-score-value');
    const healthBadge = document.getElementById('health-score-badge');

    const budgetLimitValEl = document.getElementById('budget-limit-val');
    const budgetRemainingValEl = document.getElementById('budget-remaining-val');
    const budgetRemainingText = document.getElementById('budget-remaining-text');
    const budgetProgressBar = document.getElementById('budget-progress-bar');
    const budgetPercentageText = document.getElementById('budget-percentage');

    const savingsGoalTitleEl = document.getElementById('savings-goal-title');
    const savingsGoalSavedEl = document.getElementById('savings-goal-saved');
    const savingsGoalTargetEl = document.getElementById('savings-goal-target');
    const savingsGoalProgressBar = document.getElementById('savings-goal-progress');
    const savingsGoalPctText = document.getElementById('savings-goal-percentage');

    const smartInsightsList = document.getElementById('smart-insights-list');

    const calMonthYear = document.getElementById('calendar-month-year');
    const calDaysGrid = document.getElementById('calendar-days-grid');
    const calSpinner = document.getElementById('calendar-spinner');

    const weeklyAvgDailySpend = document.getElementById('avg-daily-spend');
    const weeklyHighestSpendDay = document.getElementById('highest-spending-day');
    const weeklyLowestSpendDay = document.getElementById('lowest-spending-day');
    const weeklyTxnsCount = document.getElementById('weekly-txns-count');
    const weeklyMostUsedCat = document.getElementById('most-used-category');

    const widgetBudgetLimit = document.getElementById('widget-budget-limit');
    const widgetBudgetSpent = document.getElementById('widget-budget-spent');
    const widgetBudgetRemaining = document.getElementById('widget-budget-remaining');
    const widgetBudgetProgressBar = document.getElementById('widget-budget-progress-bar');
    const widgetBudgetWarning = document.getElementById('widget-budget-warning');
    const widgetBudgetPct = document.getElementById('budget-progress-percentage');
    const budgetBanner = document.getElementById('budget-banner-alert');

    // Toast Notifications System
    function showToast(message, type = 'error') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm transform translate-y-2 opacity-0 transition-all duration-300 pointer-events-auto min-w-[280px] z-50';
        
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

    // Live Search suggestions dropdown handler
    const dashboardSearch = document.getElementById('dashboard-search');
    const suggestionsBox = document.getElementById('search-suggestions');
    if (dashboardSearch && suggestionsBox) {
        dashboardSearch.addEventListener('input', () => {
            const val = dashboardSearch.value.trim().toLowerCase();
            if (!val) {
                suggestionsBox.classList.add('hidden');
                return;
            }

            const matched = transactions.filter(t => 
                t.title.toLowerCase().includes(val) || 
                t.category.toLowerCase().includes(val) || 
                (t.description && t.description.toLowerCase().includes(val))
            ).slice(0, 5);

            if (matched.length === 0) {
                suggestionsBox.innerHTML = `<div class="p-3 text-xs text-slate-400 text-center font-medium">No matches found.</div>`;
            } else {
                suggestionsBox.innerHTML = matched.map(t => `
                    <div class="suggestion-item p-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center text-xs border-b border-slate-100 last:border-0" data-id="${t._id}">
                        <div class="flex items-center gap-2">
                            <span>${getCategoryIcon(t.category)}</span>
                            <div>
                                <p class="font-bold text-slate-700">${t.title}</p>
                                <p class="text-[10px] text-slate-400 font-medium">${t.category} · ${formatDate(t.date)}</p>
                            </div>
                        </div>
                        <span class="font-extrabold ${t.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}">
                            ${t.type === 'expense' ? '-' : '+'}${getCurrencySymbol()}${formatCurrency(t.amount)}
                        </span>
                    </div>
                `).join('');

                suggestionsBox.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const targetId = item.getAttribute('data-id');
                        const target = transactions.find(t => t._id === targetId);
                        if (target) openDetailModal(target);
                        suggestionsBox.classList.add('hidden');
                        dashboardSearch.value = '';
                    });
                });
            }
            suggestionsBox.classList.remove('hidden');
        });

        // Close search when typing out of box
        window.addEventListener('click', (e) => {
            if (e.target !== dashboardSearch) {
                suggestionsBox.classList.add('hidden');
            }
        });
    }

    // Modal helpers
    const setupModalEvents = (modalId, closeBtnId, cancelBtnId) => {
        const modal = document.getElementById(modalId);
        const closeBtn = document.getElementById(closeBtnId);
        const cancelBtn = document.getElementById(cancelBtnId);
        
        const closeModal = () => {
            modal.classList.add('opacity-0');
            modal.querySelector('.transform').classList.add('scale-95');
            setTimeout(() => modal.classList.add('hidden'), 300);
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        return { closeModal };
    };

    // Modal Control wrappers
    const budgetModalCtrl = setupModalEvents('budget-settings-modal', 'close-budget-modal-btn', 'close-budget-modal-btn');
    const savingsModalCtrl = setupModalEvents('savings-goal-modal', 'close-savings-modal-btn', 'close-savings-modal-btn');
    const txnModalCtrl = setupModalEvents('add-transaction-modal', 'close-txn-modal-btn', 'cancel-txn-modal-btn');
    const detailModalCtrl = setupModalEvents('txn-detail-modal', 'close-detail-modal-btn', 'close-detail-modal-btn');
    
    // Calendar Date Modal Setup
    const calModal = document.getElementById('calendar-detail-modal');
    const closeCalBtn = document.getElementById('close-cal-modal-btn');
    const dismissCalBtn = document.getElementById('cal-modal-dismiss-btn');
    const closeCalModal = () => {
        calModal.classList.add('opacity-0');
        calModal.querySelector('.transform').classList.add('scale-95');
        setTimeout(() => calModal.classList.add('hidden'), 300);
    };
    if (closeCalBtn) closeCalBtn.addEventListener('click', closeCalModal);
    if (dismissCalBtn) dismissCalBtn.addEventListener('click', closeCalModal);
    calModal.addEventListener('click', (e) => { if (e.target === calModal) closeCalModal(); });

    // Warning Modal Control
    const warningModal = document.getElementById('budget-warning-modal');
    const closeWarningBtn = document.getElementById('close-warning-btn');
    const warningAdjustBtn = document.getElementById('warning-adjust-btn');
    const closeWarningModal = () => {
        warningModal.classList.add('opacity-0');
        warningModal.querySelector('.transform').classList.add('scale-95');
        setTimeout(() => warningModal.classList.add('hidden'), 300);
    };
    if (closeWarningBtn) closeWarningBtn.addEventListener('click', closeWarningModal);
    if (warningAdjustBtn) {
        warningAdjustBtn.addEventListener('click', () => {
            closeWarningModal();
            openBudgetModal();
        });
    }

    // ESC closes all modals
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.fixed.inset-0').forEach(m => {
                m.classList.add('opacity-0');
                const box = m.querySelector('.transform');
                if (box) box.classList.add('scale-95');
                setTimeout(() => m.classList.add('hidden'), 300);
            });
        }
    });

    const openBudgetModal = () => {
        const modal = document.getElementById('budget-settings-modal');
        const limitVal = localStorage.getItem('monthly_budget') || '10000';
        document.getElementById('input-budget-limit').value = limitVal;
        
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modal.querySelector('.transform').classList.remove('scale-95');
        }, 10);
    };

    const openSavingsModal = () => {
        const modal = document.getElementById('savings-goal-modal');
        document.getElementById('input-savings-title').value = localStorage.getItem('savings_goal_title') || 'Laptop';
        document.getElementById('input-savings-target').value = localStorage.getItem('savings_goal_target') || '70000';
        document.getElementById('input-savings-saved').value = localStorage.getItem('savings_goal_saved') || '25000';

        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modal.querySelector('.transform').classList.remove('scale-95');
        }, 10);
    };

    const openTxnModal = (type = 'expense', editTarget = null) => {
        const modal = document.getElementById('add-transaction-modal');
        const submitTitle = document.getElementById('modal-txn-title');
        
        if (editTarget) {
            submitTitle.textContent = 'Edit Transaction';
            document.getElementById('txn-edit-id').value = editTarget._id;
            document.getElementById('txn-amount').value = editTarget.amount;
            document.getElementById('txn-category').value = editTarget.category;
            document.getElementById('txn-date').value = new Date(editTarget.date).toISOString().split('T')[0];
            document.getElementById('txn-desc').value = editTarget.title;
            
            toggleModalType(editTarget.type);
        } else {
            submitTitle.textContent = 'Add Transaction';
            document.getElementById('txn-edit-id').value = '';
            document.getElementById('txn-amount').value = '';
            document.getElementById('txn-category').value = type === 'expense' ? 'Food' : 'Salary';
            document.getElementById('txn-date').valueAsDate = new Date();
            document.getElementById('txn-desc').value = '';
            
            toggleModalType(type);
        }

        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modal.querySelector('.transform').classList.remove('scale-95');
        }, 10);
    };

    // Toggle logic for Expense/Income inside Modal
    let modalActiveType = 'expense';
    const toggleModalType = (type) => {
        modalActiveType = type;
        const expBtn = document.getElementById('modal-type-expense-btn');
        const incBtn = document.getElementById('modal-type-income-btn');
        
        if (type === 'expense') {
            expBtn.className = 'py-2 text-xs font-bold rounded-lg text-slate-700 bg-white shadow-sm focus:outline-none';
            incBtn.className = 'py-2 text-xs font-bold rounded-lg text-slate-400 focus:outline-none';
        } else {
            incBtn.className = 'py-2 text-xs font-bold rounded-lg text-slate-700 bg-white shadow-sm focus:outline-none';
            expBtn.className = 'py-2 text-xs font-bold rounded-lg text-slate-400 focus:outline-none';
        }
    };
    document.getElementById('modal-type-expense-btn').addEventListener('click', () => toggleModalType('expense'));
    document.getElementById('modal-type-income-btn').addEventListener('click', () => toggleModalType('income'));

    // Details Modal
    const openDetailModal = (t) => {
        const modal = document.getElementById('txn-detail-modal');
        document.getElementById('detail-icon-box').textContent = getCategoryIcon(t.category);
        document.getElementById('detail-title').textContent = t.title;
        
        const catBadge = document.getElementById('detail-category-badge');
        catBadge.textContent = t.category;
        catBadge.className = `inline-block mt-1 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-md ${getCategoryColor(t.category)}`;

        document.getElementById('detail-amount-val').textContent = `${getCurrencySymbol()}${formatCurrency(t.amount)}`;
        const typeVal = document.getElementById('detail-type-val');
        typeVal.textContent = t.type;
        typeVal.className = t.type === 'expense' ? 'font-bold text-rose-500 uppercase' : 'font-bold text-emerald-500 uppercase';
        
        const dateObj = new Date(t.date);
        document.getElementById('detail-date-val').textContent = formatDate(t.date);
        document.getElementById('detail-time-val').textContent = dateObj.toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: true
        });

        // Edit button inside detail modal
        const editBtn = document.getElementById('detail-edit-btn');
        editBtn.onclick = () => {
            detailModalCtrl.closeModal();
            openTxnModal(t.type, t);
        };

        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modal.querySelector('.transform').classList.remove('scale-95');
        }, 10);
    };

    // Live notification updates
    const pushNotification = (message) => {
        notifications.unshift({ id: Date.now(), text: message });
        const count = document.getElementById('notification-count');
        const list = document.getElementById('notification-list');
        
        if (count) {
            count.textContent = notifications.length;
            count.classList.remove('hidden');
        }

        if (list) {
            list.innerHTML = notifications.map(n => `
                <div class="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 flex items-start gap-2">
                    <span class="text-primary mt-0.5">🔔</span>
                    <span>${n.text}</span>
                </div>
            `).join('');
        }
    };

    document.getElementById('clear-notifications-btn').addEventListener('click', () => {
        notifications = [];
        const count = document.getElementById('notification-count');
        const list = document.getElementById('notification-list');
        if (count) count.classList.add('hidden');
        if (list) list.innerHTML = `<div class="text-center py-6 text-xs text-slate-400">No new alerts.</div>`;
    });

    // Main Calculations and metrics synchronization
    const syncDashboardMetrics = async () => {
        try {
            const budgetLimit = Number(localStorage.getItem('monthly_budget') || '10000');
            const data = await transactionAPI.getDashboardMetrics(budgetLimit);

            // 1. All-time balances
            netBalanceEl.textContent = formatCurrency(data.netBalance || 0);
            totalIncomeEl.textContent = formatCurrency(data.totalIncome || 0);
            totalExpenseEl.textContent = formatCurrency(data.totalExpense || 0);

            // 2. Today's totals
            todayExpenseEl.textContent = formatCurrency(data.todaySummary.expense);
            todayIncomeEl.textContent = formatCurrency(data.todaySummary.income);
            todayTxnsEl.textContent = data.todaySummary.transactionsCount;

            // 3. Weekly/Monthly Analytics Cards
            weeklyAvgDailySpend.textContent = formatCurrency(data.weeklyAnalytics.avgDailyExpense);
            weeklyTxnsCount.textContent = data.weeklyAnalytics.transactionsCount;
            weeklyMostUsedCat.textContent = data.weeklyAnalytics.mostUsedCategory;

            if (data.weeklyAnalytics.highestSpendingDay) {
                const formatted = new Date(data.weeklyAnalytics.highestSpendingDay.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                weeklyHighestSpendDay.textContent = `${formatted} (${getCurrencySymbol()}${formatCurrency(data.weeklyAnalytics.highestSpendingDay.amount)})`;
            } else {
                weeklyHighestSpendDay.textContent = 'None';
            }

            if (data.weeklyAnalytics.lowestSpendingDay) {
                const formatted = new Date(data.weeklyAnalytics.lowestSpendingDay.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                weeklyLowestSpendDay.textContent = `${formatted} (${getCurrencySymbol()}${formatCurrency(data.weeklyAnalytics.lowestSpendingDay.amount)})`;
            } else {
                weeklyLowestSpendDay.textContent = 'None';
            }

            // 4. Budget limits & warnings
            const monthlyExpense = data.currentMonthMetrics.expense;
            budgetLimitValEl.textContent = formatCurrency(budgetLimit);
            widgetBudgetLimit.textContent = formatCurrency(budgetLimit);
            widgetBudgetSpent.textContent = formatCurrency(monthlyExpense);

            const remaining = budgetLimit - monthlyExpense;
            budgetRemainingValEl.textContent = formatCurrency(Math.max(0, remaining));
            widgetBudgetRemaining.textContent = formatCurrency(Math.max(0, remaining));

            if (remaining < 0) {
                budgetRemainingText.classList.remove('text-emerald-600');
                budgetRemainingText.classList.add('text-danger');
            } else {
                budgetRemainingText.classList.remove('text-danger');
                budgetRemainingText.classList.add('text-emerald-600');
            }

            const usagePct = budgetLimit > 0 ? (monthlyExpense / budgetLimit) * 100 : 0;
            budgetPercentageText.textContent = `${Math.round(Math.max(0, 100 - usagePct))}% Left`;
            widgetBudgetPct.textContent = `${Math.round(Math.max(0, 100 - usagePct))}% Left`;

            budgetProgressBar.className = 'h-full rounded-full transition-all duration-700';
            widgetBudgetProgressBar.className = 'h-full rounded-full transition-all duration-700';

            if (usagePct >= 100) {
                budgetProgressBar.classList.add('bg-danger');
                widgetBudgetProgressBar.classList.add('bg-danger');
                widgetBudgetWarning.classList.remove('hidden');
                budgetBanner.classList.remove('hidden');
                
                // Triggers warning modal once
                const lastWarning = sessionStorage.getItem('budget_warned');
                if (!lastWarning || Number(lastWarning) < monthlyExpense) {
                    document.getElementById('warning-spent-val').textContent = formatCurrency(monthlyExpense);
                    document.getElementById('warning-limit-val').textContent = formatCurrency(budgetLimit);
                    warningModal.classList.remove('hidden');
                    setTimeout(() => {
                        warningModal.classList.remove('opacity-0');
                        warningModal.querySelector('.transform').classList.remove('scale-95');
                    }, 10);
                    sessionStorage.setItem('budget_warned', monthlyExpense.toString());
                    pushNotification(`Warning: Monthly budget of ₹${budgetLimit} exceeded!`);
                }
            } else if (usagePct >= 80) {
                budgetProgressBar.classList.add('bg-warning');
                widgetBudgetProgressBar.classList.add('bg-warning');
                widgetBudgetWarning.classList.add('hidden');
                budgetBanner.classList.add('hidden');
                pushNotification(`Alert: You used over 80% of your monthly budget.`);
            } else {
                budgetProgressBar.classList.add('bg-success');
                widgetBudgetProgressBar.classList.add('bg-success');
                widgetBudgetWarning.classList.add('hidden');
                budgetBanner.classList.add('hidden');
            }

            budgetProgressBar.style.width = `${Math.min(100, usagePct)}%`;
            widgetBudgetProgressBar.style.width = `${Math.min(100, usagePct)}%`;

            // 5. Financial Health Score Ring animation
            const healthObj = calculateHealthScore(data.currentMonthMetrics.income, monthlyExpense, budgetLimit);
            healthVal.textContent = healthObj.score;
            healthBadge.textContent = healthObj.label;
            
            healthBadge.className = 'px-2.5 py-1 text-[10px] font-extrabold rounded-lg uppercase tracking-wider border';
            if (healthObj.score >= 85) {
                healthBadge.classList.add('bg-emerald-50', 'text-emerald-700', 'border-emerald-100');
                healthRing.setAttribute('stroke', '#10B981');
            } else if (healthObj.score >= 70) {
                healthBadge.classList.add('bg-indigo-50', 'text-primary', 'border-indigo-100');
                healthRing.setAttribute('stroke', '#4F46E5');
            } else if (healthObj.score >= 50) {
                healthBadge.classList.add('bg-amber-50', 'text-warning', 'border-amber-100');
                healthRing.setAttribute('stroke', '#F59E0B');
            } else {
                healthBadge.classList.add('bg-rose-50', 'text-danger', 'border-rose-100');
                healthRing.setAttribute('stroke', '#EF4444');
            }
            healthRing.setAttribute('stroke-dasharray', `${healthObj.score} ${100 - healthObj.score}`);

            // 6. Smart Insights
            smartInsightsList.innerHTML = data.smartInsights.map(insight => `
                <div class="flex items-center gap-2.5 p-3.5 bg-slate-50/50 border border-slate-200/50 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                    ${insight}
                </div>
            `).join('');

        } catch (error) {
            console.error('Failed to load dashboard metrics:', error);
            showToast('Failed to load summary metrics.');
        }
    };

    // Calculate health score formula
    const calculateHealthScore = (income, expense, budgetLimit) => {
        let score = 75; // baseline

        if (budgetLimit > 0) {
            const ratio = expense / budgetLimit;
            if (ratio <= 0.5) score += 10;
            else if (ratio <= 0.8) score += 5;
            else if (ratio > 1.2) score -= 15;
            else if (ratio > 1.0) score -= 10;
        }

        if (income > 0) {
            const savings = (income - expense) / income;
            if (savings >= 0.3) score += 15;
            else if (savings >= 0.1) score += 8;
            else if (savings < 0) score -= 15;
        } else if (expense > 0) {
            score -= 15;
        }

        score = Math.max(0, Math.min(100, score));
        let label = 'Average';
        if (score >= 85) label = 'Excellent';
        else if (score >= 70) label = 'Good';
        else if (score >= 50) label = 'Average';
        else label = 'Needs Improvement';

        return { score, label };
    };

    // Savings Goals updates
    const syncSavingsGoals = () => {
        const title = localStorage.getItem('savings_goal_title') || 'Laptop';
        const target = Number(localStorage.getItem('savings_goal_target') || '70000');
        const saved = Number(localStorage.getItem('savings_goal_saved') || '25000');
        const pct = target > 0 ? Math.min((saved / target) * 100, 100) : 0;

        savingsGoalTitleEl.textContent = title;
        savingsGoalSavedEl.textContent = formatCurrency(saved);
        savingsGoalTargetEl.textContent = formatCurrency(target);
        savingsGoalProgressBar.style.width = `${pct}%`;
        savingsGoalPctText.textContent = `${Math.round(pct)}%`;

        if (pct >= 100) {
            pushNotification(`Goal Achieved: You reached target savings for ${title}!`);
        }
    };

    // Spending Trend Bar Chart Builder
    const renderTrendChart = () => {
        const currencySymbol = getCurrencySymbol();
        const trendCtx = document.getElementById('trendChart');
        if (!trendCtx) return;

        if (trendChartInstance) trendChartInstance.destroy();

        // Accumulate labels & values based on interval
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        let labels = [];
        let values = [];

        if (currentTrendInterval === 'weekly') {
            const today = new Date();
            const days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                days.push(d);
            }
            labels = days.map(d => d.toLocaleDateString('en-US', { weekday: 'short' }));
            
            const dayValues = {};
            days.forEach(d => { dayValues[d.toISOString().split('T')[0]] = 0; });
            expenseTransactions.forEach(t => {
                const dateKey = new Date(t.date).toISOString().split('T')[0];
                if (dayValues[dateKey] !== undefined) dayValues[dateKey] += t.amount;
            });
            values = Object.values(dayValues);

        } else if (currentTrendInterval === 'monthly') {
            const today = new Date();
            const totalDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            for (let i = 1; i <= totalDays; i++) {
                labels.push(`${i}`);
            }
            const dayValues = {};
            for (let i = 1; i <= totalDays; i++) {
                const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                dayValues[dateKey] = 0;
            }
            expenseTransactions.forEach(t => {
                const dateKey = new Date(t.date).toISOString().split('T')[0];
                if (dayValues[dateKey] !== undefined) dayValues[dateKey] += t.amount;
            });
            values = Object.values(dayValues);

        } else {
            // Yearly
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthValues = Array(12).fill(0);
            const currentYear = new Date().getFullYear();
            expenseTransactions.forEach(t => {
                const tDate = new Date(t.date);
                if (tDate.getFullYear() === currentYear) {
                    monthValues[tDate.getMonth()] += t.amount;
                }
            });
            values = monthValues;
        }

        trendChartInstance = new Chart(trendCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Spent',
                    data: values,
                    backgroundColor: 'rgba(79, 70, 229, 0.85)',
                    hoverBackgroundColor: '#4F46E5',
                    borderRadius: 8,
                    barPercentage: 0.65
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
                            font: { size: 9, family: 'Plus Jakarta Sans', weight: 'bold' },
                            callback: (val) => `${currencySymbol}${val}`
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 9, family: 'Plus Jakarta Sans', weight: 'bold' } }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ` Spent: ${currencySymbol}${formatCurrency(ctx.raw)}`
                        }
                    }
                }
            }
        });
    };

    // Category Doughnut Chart Builder
    const renderCategoryChart = () => {
        const currencySymbol = getCurrencySymbol();
        const catCtx = document.getElementById('categoryChart');
        if (!catCtx) return;

        if (categoryChartInstance) categoryChartInstance.destroy();

        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        const dataMap = {};
        expenseTransactions.forEach(t => {
            dataMap[t.category] = (dataMap[t.category] || 0) + t.amount;
        });

        const labels = Object.keys(dataMap);
        const values = Object.values(dataMap);

        if (labels.length === 0) {
            // Draw dummy label for empty chart
            categoryChartInstance = new Chart(catCtx, {
                type: 'doughnut',
                data: {
                    labels: ['No Data'],
                    datasets: [{
                        data: [1],
                        backgroundColor: ['#cbd5e1'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: { legend: { display: false } }
                }
            });
            return;
        }

        categoryChartInstance = new Chart(catCtx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        '#10B981', // Food (Green)
                        '#3B82F6', // Transport (Blue)
                        '#8B5CF6', // Shopping (Purple)
                        '#F59E0B', // Bills (Orange)
                        '#EC4899', // Entertainment (Pink)
                        '#EF4444', // Medical (Red)
                        '#64748B'  // Other (Gray)
                    ],
                    borderWidth: 3,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 8,
                            padding: 10,
                            font: { size: 10, family: 'Plus Jakarta Sans', weight: 'bold' }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ` ${ctx.label}: ${currencySymbol}${formatCurrency(ctx.raw)}`
                        }
                    }
                },
                // Add click events to slice to filter recent transactions list!
                onClick: (e, activeEl) => {
                    if (activeEl.length > 0) {
                        const index = activeEl[0].index;
                        const selectedCategory = labels[index];
                        if (activeCategoryFilter === selectedCategory) {
                            activeCategoryFilter = null; // Toggle off
                            showToast('Category filter cleared', 'success');
                        } else {
                            activeCategoryFilter = selectedCategory;
                            showToast(`Filtered by category: ${selectedCategory}`, 'success');
                        }
                        filterAndRenderList();
                    }
                }
            }
        });
    };

    // Filter, Sort, & Render Recent Transactions list
    const filterAndRenderList = () => {
        let filtered = [...transactions];

        // Chart Slice category filter
        if (activeCategoryFilter) {
            filtered = filtered.filter(t => t.category === activeCategoryFilter);
        }

        // Dropdown Category Filter
        const catDropdown = document.getElementById('filter-category');
        if (catDropdown && catDropdown.value !== 'all') {
            filtered = filtered.filter(t => t.category === catDropdown.value);
        }

        // Sort selector
        const sortVal = document.getElementById('sort-selector').value;
        if (sortVal === 'date-desc') {
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (sortVal === 'date-asc') {
            filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (sortVal === 'amount-desc') {
            filtered.sort((a, b) => Number(b.amount) - Number(a.amount));
        } else if (sortVal === 'amount-asc') {
            filtered.sort((a, b) => Number(a.amount) - Number(b.amount));
        }

        renderListItems(filtered);
    };

    const renderListItems = (list) => {
        transactionsList.innerHTML = '';
        const currencySymbol = getCurrencySymbol();

        if (list.length === 0) {
            transactionsList.innerHTML = `
                <div class="text-center py-10 text-slate-400">
                    <span class="text-3xl block mb-2">📌</span>
                    <p class="text-xs font-semibold">No recent transactions recorded.</p>
                </div>
            `;
            return;
        }

        list.forEach(t => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between p-3.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/50 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group';
            
            const isExpense = t.type === 'expense';
            const icon = getCategoryIcon(t.category);
            const badgeClass = getCategoryColor(t.category);
            const prefix = isExpense ? '-' : '+';
            const textClass = isExpense ? 'text-slate-800' : 'text-emerald-600';

            let timeStr = '12:00 PM';
            if (t.date) {
                const dateObj = new Date(t.date);
                timeStr = dateObj.toLocaleTimeString('en-US', {
                    hour: '2-digit', minute: '2-digit', hour12: true
                });
            }

            item.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg ${badgeClass}">
                        ${icon}
                    </div>
                    <div>
                        <h4 class="font-bold text-slate-800 text-xs md:text-sm">${t.title}</h4>
                        <div class="flex items-center gap-2 mt-0.5">
                            <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${badgeClass}">${t.category}</span>
                            <span class="text-[9px] text-slate-400 font-semibold">${formatDate(t.date)} · ${timeStr}</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="font-extrabold font-heading text-xs md:text-sm ${textClass}">${prefix}${currencySymbol}${formatCurrency(t.amount)}</span>
                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="edit-btn p-1 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors focus:outline-none" data-id="${t._id}">
                            <i class="ph ph-pencil-simple text-base"></i>
                        </button>
                        <button class="delete-btn p-1 text-slate-400 hover:text-danger hover:bg-slate-100 rounded-lg transition-colors focus:outline-none" data-id="${t._id}">
                            <i class="ph ph-trash text-base"></i>
                        </button>
                    </div>
                </div>
            `;

            // Clicking card (except action buttons) opens details
            item.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    openDetailModal(t);
                }
            });

            transactionsList.appendChild(item);
        });

        // Edit button binder
        transactionsList.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const target = transactions.find(t => t._id === id);
                if (target) openTxnModal(target.type, target);
            });
        });

        // Delete button binder
        transactionsList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                if (confirm('Permanently delete this transaction?')) {
                    try {
                        await transactionAPI.delete(id);
                        showToast('Transaction deleted successfully', 'success');
                        fetchData();
                    } catch (error) {
                        showToast('Failed to delete transaction');
                    }
                }
            });
        });
    };

    // Category and Sort dropdown listeners
    document.getElementById('filter-category').addEventListener('change', filterAndRenderList);
    document.getElementById('sort-selector').addEventListener('change', filterAndRenderList);

    // Spend Trend Interval selection buttons
    const btnWeekly = document.getElementById('trend-weekly-btn');
    const btnMonthly = document.getElementById('trend-monthly-btn');
    const btnYearly = document.getElementById('trend-yearly-btn');
    
    const setTrendInterval = (interval, activeBtn) => {
        currentTrendInterval = interval;
        [btnWeekly, btnMonthly, btnYearly].forEach(btn => {
            btn.className = 'px-2.5 py-1 text-[10px] font-bold rounded-md text-slate-400 hover:text-slate-700 focus:outline-none transition-all';
        });
        activeBtn.className = 'px-2.5 py-1 text-[10px] font-bold rounded-md text-slate-700 bg-white shadow-sm focus:outline-none transition-all';
        renderTrendChart();
    };

    btnWeekly.addEventListener('click', () => setTrendInterval('weekly', btnWeekly));
    btnMonthly.addEventListener('click', () => setTrendInterval('monthly', btnMonthly));
    btnYearly.addEventListener('click', () => setTrendInterval('yearly', btnYearly));

    // Expense Calendar Widget
    const renderCalendar = () => {
        const currencySymbol = getCurrencySymbol();
        calDaysGrid.innerHTML = '';

        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        calMonthYear.textContent = `${monthNames[month]} ${year}`;

        let firstDayIndex = new Date(year, month, 1).getDay();
        firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Mon-first

        const totalDays = new Date(year, month + 1, 0).getDate();
        const prevMonthTotalDays = new Date(year, month, 0).getDate();

        // 1. Padding days
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const dayNum = prevMonthTotalDays - i;
            const cell = document.createElement('div');
            cell.className = 'p-1 text-slate-300 bg-slate-50/20 text-center opacity-40 select-none flex items-center justify-center';
            cell.innerHTML = `<span>${dayNum}</span>`;
            calDaysGrid.appendChild(cell);
        }

        // 2. Active month days
        const todayStr = new Date().toISOString().split('T')[0];

        // Gather calendar grouping
        const calData = {};
        transactions.forEach(t => {
            const dateStr = new Date(t.date).toISOString().split('T')[0];
            if (!calData[dateStr]) calData[dateStr] = [];
            calData[dateStr].push(t);
        });

        for (let day = 1; day <= totalDays; day++) {
            const dateObj = new Date(year, month, day);
            const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
            
            const isToday = dateStr === todayStr;
            const list = calData[dateStr] || [];
            const expensesOnly = list.filter(t => t.type === 'expense');
            const dailySum = expensesOnly.reduce((sum, t) => sum + t.amount, 0);

            const cell = document.createElement('div');
            cell.className = 'p-1 hover:bg-indigo-50/50 hover:scale-105 transition-all duration-200 cursor-pointer flex flex-col justify-between text-center min-h-[50px] relative border-b border-r border-slate-100 bg-white';
            
            if (isToday) {
                cell.classList.add('ring-1.5', 'ring-primary', 'ring-inset', 'z-10');
            }
            if (dailySum > 0) {
                cell.classList.add('bg-blue-50/40', 'border-emerald-300');
            }

            cell.innerHTML = `
                <span class="${isToday ? 'text-primary' : 'text-slate-700'}">${day}</span>
                ${dailySum > 0 ? `<span class="text-[8px] font-extrabold text-rose-500 truncate max-w-full block">${currencySymbol}${formatCurrency(dailySum)}</span>` : ''}
            `;

            cell.addEventListener('click', () => {
                openCalDateModal(dateStr, dateObj, list);
            });

            calDaysGrid.appendChild(cell);
        }

        // 3. Next month padding
        const paddingCount = 42 - (firstDayIndex + totalDays);
        for (let i = 1; i <= paddingCount; i++) {
            const cell = document.createElement('div');
            cell.className = 'p-1 text-slate-300 bg-slate-50/20 text-center opacity-40 select-none flex items-center justify-center';
            cell.innerHTML = `<span>${i}</span>`;
            calDaysGrid.appendChild(cell);
        }
    };

    // Open detailed date modal from Calendar click
    const openCalDateModal = (dateStr, dateObj, dayList) => {
        const listContainer = document.getElementById('cal-modal-list');
        document.getElementById('cal-modal-date').textContent = dateObj.toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        
        const expensesOnly = dayList.filter(t => t.type === 'expense');
        const sum = expensesOnly.reduce((tot, t) => tot + t.amount, 0);
        document.getElementById('cal-modal-total').textContent = `${getCurrencySymbol()}${formatCurrency(sum)}`;
        document.getElementById('cal-modal-count').textContent = `${expensesOnly.length} ${expensesOnly.length === 1 ? 'Expense' : 'Expenses'}`;

        if (dayList.length === 0) {
            listContainer.innerHTML = `
                <div class="text-center py-8 text-slate-400 flex flex-col items-center justify-center gap-2">
                    <span class="text-3xl">📌</span>
                    <p class="text-xs font-semibold text-slate-500">No expenses recorded.</p>
                </div>
            `;
        } else {
            listContainer.innerHTML = dayList.map(t => {
                const prefix = t.type === 'expense' ? '-' : '+';
                const textClass = t.type === 'expense' ? 'text-slate-800' : 'text-emerald-600';
                
                let timeVal = '12:00 PM';
                if (t.date) {
                    timeVal = new Date(t.date).toLocaleTimeString('en-US', {
                        hour: '2-digit', minute: '2-digit', hour12: true
                    });
                }
                
                return `
                    <div class="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/50 rounded-xl">
                        <div class="flex items-center gap-2.5">
                            <span class="text-lg">${getCategoryIcon(t.category)}</span>
                            <div>
                                <p class="font-bold text-slate-700 text-xs">${t.title}</p>
                                <p class="text-[9px] text-slate-400 font-semibold uppercase mt-0.5">${t.category} · ${timeVal}</p>
                            </div>
                        </div>
                        <span class="font-extrabold text-xs ${textClass}">${prefix}${getCurrencySymbol()}${formatCurrency(t.amount)}</span>
                    </div>
                `;
            }).join('');
        }

        calModal.classList.remove('hidden');
        setTimeout(() => {
            calModal.classList.remove('opacity-0');
            calModal.querySelector('.transform').classList.remove('scale-95');
        }, 10);
    };

    document.getElementById('prev-month-btn').addEventListener('click', () => {
        calendarDate.setMonth(calendarDate.getMonth() - 1);
        renderCalendar();
    });
    document.getElementById('next-month-btn').addEventListener('click', () => {
        calendarDate.setMonth(calendarDate.getMonth() + 1);
        renderCalendar();
    });

    // Form submits
    // Set Budget submit handler
    document.getElementById('budget-settings-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const limitVal = document.getElementById('input-budget-limit').value;
        localStorage.setItem('monthly_budget', limitVal);
        showToast('Monthly budget limit updated successfully!', 'success');
        budgetModalCtrl.closeModal();
        syncDashboardMetrics();
    });

    // Set Savings Goal submit handler
    document.getElementById('savings-goal-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('input-savings-title').value;
        const target = document.getElementById('input-savings-target').value;
        const saved = document.getElementById('input-savings-saved').value;

        localStorage.setItem('savings_goal_title', title);
        localStorage.setItem('savings_goal_target', target);
        localStorage.setItem('savings_goal_saved', saved);

        showToast('Savings goal settings updated!', 'success');
        savingsModalCtrl.closeModal();
        syncSavingsGoals();
    });

    // Add/Edit Transaction Form submit handler
    document.getElementById('add-txn-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const editId = document.getElementById('txn-edit-id').value;
        
        const payload = {
            title: document.getElementById('txn-desc').value,
            amount: Number(document.getElementById('txn-amount').value),
            category: document.getElementById('txn-category').value,
            date: document.getElementById('txn-date').value,
            type: modalActiveType
        };

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const origText = submitBtn.textContent;
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;

        try {
            if (editId) {
                await transactionAPI.update(editId, payload);
                showToast('Transaction record updated!', 'success');
            } else {
                await transactionAPI.add(payload);
                showToast('Transaction added successfully!', 'success');
            }
            txnModalCtrl.closeModal();
            fetchData();
        } catch (error) {
            showToast('Failed to save transaction');
        } finally {
            submitBtn.textContent = origText;
            submitBtn.disabled = false;
        }
    });

    // Native reports exporters
    const exportCSV = () => {
        if (transactions.length === 0) {
            showToast('No transaction ledger data to export.', 'warning');
            return;
        }
        let csv = 'Date,Title,Type,Category,Amount,Description\n';
        transactions.forEach(t => {
            csv += `${new Date(t.date).toISOString().split('T')[0]},"${t.title.replace(/"/g, '""')}",${t.type},${t.category},${t.amount},"${(t.description || '').replace(/"/g, '""')}"\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `smart_kharcha_report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        showToast('CSV report exported successfully!', 'success');
    };

    const exportPDF = () => {
        if (transactions.length === 0) {
            showToast('No transaction ledger data to export.', 'warning');
            return;
        }
        const printWindow = window.open('', '_blank');
        let rowsHtml = '';
        transactions.forEach(t => {
            rowsHtml += `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 10px; font-size: 12px;">${new Date(t.date).toLocaleDateString()}</td>
                    <td style="padding: 10px; font-size: 12px; font-weight: bold;">${t.title}</td>
                    <td style="padding: 10px; font-size: 12px; text-transform: uppercase;">${t.type}</td>
                    <td style="padding: 10px; font-size: 12px;">${t.category}</td>
                    <td style="padding: 10px; font-size: 12px; text-align: right; font-weight: bold; color: ${t.type === 'expense' ? '#ef4444' : '#10b981'}">
                        ${t.type === 'expense' ? '-' : '+'}${getCurrencySymbol()}${t.amount}
                    </td>
                </tr>
            `;
        });
        
        printWindow.document.write(`
            <html>
            <head>
                <title>Smart Kharcha - Financial Report</title>
                <style>
                    body { font-family: sans-serif; padding: 40px; color: #1e293b; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background-color: #f1f5f9; padding: 12px 10px; text-align: left; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
                </style>
            </head>
            <body>
                <h1 style="margin: 0; font-size: 24px; color: #4f46e5;">Smart Kharcha</h1>
                <p style="margin: 5px 0 25px 0; font-size: 14px; color: #64748b;">Financial Statement generated on ${new Date().toLocaleDateString()}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
        showToast('PDF report generated!', 'success');
    };

    // Quick Actions Click Listeners
    document.getElementById('quick-action-expense-btn').addEventListener('click', () => openTxnModal('expense'));
    document.getElementById('quick-action-income-btn').addEventListener('click', () => openTxnModal('income'));
    document.getElementById('quick-action-budget-btn').addEventListener('click', openBudgetModal);
    document.getElementById('quick-action-savings-btn').addEventListener('click', openSavingsModal);
    document.getElementById('quick-action-csv-btn').addEventListener('click', exportCSV);
    document.getElementById('quick-action-pdf-btn').addEventListener('click', exportPDF);

    // Budget banner dismiss handler
    document.getElementById('dismiss-banner-btn').addEventListener('click', () => {
        budgetBanner.classList.add('hidden');
    });

    // Fetch initial transactions and calculate stats
    const fetchData = async () => {
        try {
            const data = await transactionAPI.getAll();
            transactions = data.transactions || data || [];

            // Trigger sync of calculations
            await syncDashboardMetrics();
            syncSavingsGoals();
            
            // Render UI charts & lists
            renderTrendChart();
            renderCategoryChart();
            renderCalendar();
            filterAndRenderList();

            updateCurrencyDisplay();
        } catch (error) {
            console.error('Error fetching dashboard transactions:', error);
            showToast('Failed to load ledger records.');
        }
    };

    // Init load
    fetchData();
});
