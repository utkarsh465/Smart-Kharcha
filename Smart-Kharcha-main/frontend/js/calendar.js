import { transactionAPI, getToken } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (!getToken()) {
        window.location.href = 'index.html';
        return;
    }

    // Handle Logout
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

    // Currency Settings Helper
    const getCurrencySymbol = () => localStorage.getItem('currency') || '₹';
    
    const formatCurrency = (amount) => {
        return Number(amount).toLocaleString('en-IN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    // Category mapping icons and color badges
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

    const getCategoryBadgeClass = (category) => {
        const colors = {
            'Food': 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
            'Transport': 'bg-blue-50 text-blue-700 border border-blue-200/60',
            'Travel': 'bg-blue-50 text-blue-700 border border-blue-200/60',
            'Shopping': 'bg-purple-50 text-purple-700 border border-purple-200/60',
            'Medical': 'bg-rose-50 text-rose-700 border border-rose-200/60',
            'Bills': 'bg-amber-50 text-amber-700 border border-amber-200/60',
            'Entertainment': 'bg-pink-50 text-pink-700 border border-pink-200/60',
            'Education': 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
            'Other': 'bg-slate-50 text-slate-700 border border-slate-200/60'
        };
        return colors[category] || 'bg-slate-50 text-slate-700 border border-slate-200/60';
    };

    // Calendar state
    let transactionsByDay = {}; // Key: YYYY-MM-DD
    let currentDate = new Date(); // Month view controller
    let selectedCellDate = null; // Target YYYY-MM-DD for Quick Add

    // DOM references
    const daysGrid = document.getElementById('calendar-days-grid');
    const monthYearEl = document.getElementById('calendar-month-year');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const loadingSpinner = document.getElementById('calendar-loading-spinner');
    
    const monthExpenseTotalEl = document.getElementById('month-expense-total');
    const monthIncomeTotalEl = document.getElementById('month-income-total');
    const monthTransactionsCountEl = document.getElementById('month-transactions-count');
    const monthPeakSpendingEl = document.getElementById('month-peak-spending');
    const monthAvgDailyExpenseEl = document.getElementById('month-avg-daily-expense');

    // Render Calendar GUI (Monday-first alignment)
    const renderCalendar = () => {
        const currencySymbol = getCurrencySymbol();
        daysGrid.innerHTML = '';
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth(); // 0-indexed (0=Jan, 11=Dec)
        
        // Month & Year header text
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        monthYearEl.textContent = `${monthNames[month]} ${year}`;

        // Monday-First alignment offsets:
        // getDay() gives Sun=0, Mon=1, Tue=2, ..., Sat=6
        // Under Monday-first, we map: Mon=0, Tue=1, ..., Sat=5, Sun=6
        let firstDayIndex = new Date(year, month, 1).getDay();
        firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

        const totalDays = new Date(year, month + 1, 0).getDate(); // Days in current month
        const prevMonthTotalDays = new Date(year, month, 0).getDate(); // Days in previous month

        // 1. Render Days of Previous Month (padding)
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const dayNum = prevMonthTotalDays - i;
            const cell = document.createElement('div');
            cell.className = 'calendar-cell bg-slate-50/40 p-2 text-slate-400 border-b border-r border-slate-100 flex flex-col justify-between opacity-40 select-none';
            cell.innerHTML = `<span class="text-xs font-semibold">${dayNum}</span>`;
            daysGrid.appendChild(cell);
        }

        // 2. Render Current Month Days
        const todayStr = new Date().toISOString().split('T')[0];
        
        for (let day = 1; day <= totalDays; day++) {
            const dateObj = new Date(year, month, day);
            const yearStr = dateObj.getFullYear();
            const monthStr = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dayStr = String(dateObj.getDate()).padStart(2, '0');
            const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

            const isToday = dateStr === todayStr;
            const dayTransactions = transactionsByDay[dateStr] || [];

            // Filter daily expenses & incomes
            const dayExpenses = dayTransactions.filter(t => t.type === 'expense');
            const dayIncomes = dayTransactions.filter(t => t.type === 'income');
            const totalDailyExpense = dayExpenses.reduce((sum, t) => sum + Number(t.amount), 0);

            const cell = document.createElement('div');
            cell.className = 'calendar-cell p-2 border-b border-r border-slate-200 bg-white hover:scale-[1.02] hover:shadow-md hover:z-10 cursor-pointer flex flex-col justify-between transition-all duration-200';
            
            // Highlight today's date
            if (isToday) {
                cell.classList.add('ring-2', 'ring-primary', 'ring-inset', 'z-20');
            }

            // Highlight expense days: Green border and soft blue background
            if (totalDailyExpense > 0) {
                cell.classList.add('border-emerald-400', 'bg-blue-50/50');
            }

            // Render Date number and Daily Total
            let amountHtml = '';
            if (totalDailyExpense > 0) {
                amountHtml = `
                    <div class="text-right text-[10px] md:text-xs font-extrabold text-rose-500 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-lg inline-block self-end truncate max-w-full">
                        ${currencySymbol}${formatCurrency(totalDailyExpense)}
                    </div>
                `;
            }

            cell.innerHTML = `
                <div class="flex justify-between items-center w-full">
                    <span class="text-xs md:text-sm font-bold ${isToday ? 'text-primary' : 'text-slate-700'}">${day}</span>
                    <!-- Small indicator dot for mobile view -->
                    ${dayTransactions.length > 0 ? `<span class="w-1.5 h-1.5 bg-primary rounded-full md:hidden"></span>` : ''}
                </div>
                <div class="hidden md:block w-full text-right mt-2">
                    ${amountHtml}
                </div>
            `;

            // Click interaction opens detailed modal view
            cell.addEventListener('click', () => {
                openDayModal(dateStr, dateObj, dayTransactions);
            });

            daysGrid.appendChild(cell);
        }

        // 3. Render Next Month Days (padding)
        const renderedCount = firstDayIndex + totalDays;
        const totalGridCells = 42; // standard 6 rows x 7 cols
        const paddingNext = totalGridCells - renderedCount;
        
        for (let day = 1; day <= paddingNext; day++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell bg-slate-50/40 p-2 text-slate-400 border-b border-r border-slate-100 flex flex-col justify-between opacity-40 select-none';
            cell.innerHTML = `<span class="text-xs font-semibold">${day}</span>`;
            daysGrid.appendChild(cell);
        }

        // 4. Update stats cards
        calculateMonthStats();
    };

    // Calculate month statistics
    const calculateMonthStats = () => {
        let totalExpense = 0;
        let totalIncome = 0;
        let expenseTransactionsCount = 0;
        const dailyExpenses = {};

        // Aggregate across visible month
        Object.keys(transactionsByDay).forEach(dateStr => {
            const list = transactionsByDay[dateStr] || [];
            list.forEach(t => {
                const amt = Number(t.amount);
                if (t.type === 'expense') {
                    totalExpense += amt;
                    expenseTransactionsCount++;
                    dailyExpenses[dateStr] = (dailyExpenses[dateStr] || 0) + amt;
                } else {
                    totalIncome += amt;
                }
            });
        });

        // Calculate peak spending day
        let peakDate = null;
        let peakAmt = 0;
        Object.keys(dailyExpenses).forEach(dateStr => {
            if (dailyExpenses[dateStr] > peakAmt) {
                peakAmt = dailyExpenses[dateStr];
                peakDate = dateStr;
            }
        });

        // Average daily expense
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const avgDailyExpense = totalExpense / daysInMonth;

        // Populate cards
        monthExpenseTotalEl.textContent = formatCurrency(totalExpense);
        monthIncomeTotalEl.textContent = formatCurrency(totalIncome);
        monthTransactionsCountEl.textContent = expenseTransactionsCount;
        
        if (peakDate) {
            const options = { month: 'short', day: 'numeric' };
            const formatted = new Date(peakDate).toLocaleDateString('en-IN', options);
            monthPeakSpendingEl.textContent = `${formatted} (${getCurrencySymbol()}${formatCurrency(peakAmt)})`;
        } else {
            monthPeakSpendingEl.textContent = 'None';
        }

        monthAvgDailyExpenseEl.textContent = formatCurrency(avgDailyExpense);
    };

    // Month Navigation Triggers
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        fetchTransactions();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        fetchTransactions();
    });

    // Day Details Modal Controls
    const dayModal = document.getElementById('day-modal');
    const closeDayModalBtn = document.getElementById('close-day-modal-btn');
    const dayTransactionsList = document.getElementById('day-transactions-list');
    const dayModalTitle = document.getElementById('day-modal-title');
    const dayModalDate = document.getElementById('day-modal-date');
    
    const dayModalTotal = document.getElementById('day-modal-total');
    const dayModalCount = document.getElementById('day-modal-count');

    const openDayModal = (dateStr, dateObj, dayTransactions) => {
        selectedCellDate = dateStr;
        
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dayModalTitle.textContent = 'Transactions';
        dayModalDate.textContent = dateObj.toLocaleDateString('en-IN', options);
        
        // Reset quick add fields
        document.getElementById('quick-desc').value = '';
        document.getElementById('quick-amount').value = '';
        document.getElementById('quick-category').value = 'Food';

        // Calculate total daily expense for modal summary
        const expensesOnly = dayTransactions.filter(t => t.type === 'expense');
        const dailyExpenseSum = expensesOnly.reduce((sum, t) => sum + Number(t.amount), 0);
        
        dayModalTotal.textContent = `${getCurrencySymbol()}${formatCurrency(dailyExpenseSum)}`;
        dayModalCount.textContent = `${expensesOnly.length} ${expensesOnly.length === 1 ? 'Transaction' : 'Transactions'}`;

        renderDayTransactions(dayTransactions);

        dayModal.classList.remove('hidden');
        setTimeout(() => {
            dayModal.classList.remove('opacity-0');
            dayModal.querySelector('.transform').classList.remove('scale-95');
        }, 10);
    };

    const closeDayModal = () => {
        dayModal.classList.add('opacity-0');
        dayModal.querySelector('.transform').classList.add('scale-95');
        setTimeout(() => {
            dayModal.classList.add('hidden');
        }, 300);
    };

    if (closeDayModalBtn) closeDayModalBtn.addEventListener('click', closeDayModal);

    // Keyboard support: Close modal on ESC keypress
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !dayModal.classList.contains('hidden')) {
            closeDayModal();
        }
    });

    // Click outside modal container to close it
    dayModal.addEventListener('click', (e) => {
        if (e.target === dayModal) {
            closeDayModal();
        }
    });

    // Render list inside day modal
    const renderDayTransactions = (list) => {
        dayTransactionsList.innerHTML = '';
        const currencySymbol = getCurrencySymbol();

        if (list.length === 0) {
            dayTransactionsList.innerHTML = `
                <div class="text-center py-10 text-slate-400 flex flex-col items-center justify-center gap-3">
                    <span class="text-4xl">📌</span>
                    <p class="text-xs font-semibold text-slate-500">No expenses recorded for this day.</p>
                </div>
            `;
            return;
        }

        list.forEach(t => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/50 rounded-2xl transition-all hover:bg-slate-100/50';
            
            const isExpense = t.type === 'expense';
            const iconEmoji = getCategoryIcon(t.category);
            const badgeClass = getCategoryBadgeClass(t.category);
            const amountPrefix = isExpense ? '-' : '+';
            const amountColor = isExpense ? 'text-slate-800' : 'text-emerald-600';

            // Parse transaction time or show fallback
            let timeStr = '12:00 PM';
            if (t.date) {
                const dateObj = new Date(t.date);
                timeStr = dateObj.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
            }

            item.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg ${badgeClass}">
                        ${iconEmoji}
                    </div>
                    <div>
                        <h4 class="font-bold text-slate-800 text-xs md:text-sm">${t.title}</h4>
                        <div class="flex items-center gap-1.5 mt-0.5">
                            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${badgeClass}">${t.category}</span>
                            <span class="text-[9px] text-slate-400 font-semibold">${timeStr}</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="font-extrabold font-heading text-xs md:text-sm ${amountColor}">${amountPrefix}${currencySymbol}${formatCurrency(t.amount)}</span>
                    <button class="delete-day-t-btn p-1.5 text-slate-400 hover:text-danger hover:bg-slate-100 rounded-lg transition-colors focus:outline-none" data-id="${t._id}">
                        <i class="ph ph-trash text-base"></i>
                    </button>
                </div>
            `;
            dayTransactionsList.appendChild(item);
        });

        // Day list delete listener
        dayTransactionsList.querySelectorAll('.delete-day-t-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = btn.getAttribute('data-id');
                if (confirm('Delete this transaction permanently?')) {
                    try {
                        await transactionAPI.delete(id);
                        showToast('Transaction deleted successfully', 'success');
                        closeDayModal();
                        fetchTransactions(); // Refetches and rebuilds
                    } catch (error) {
                        showToast('Error deleting transaction');
                    }
                }
            });
        });
    };

    // Quick Add Expense Form on Day Modal Submit
    document.getElementById('quick-add-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!selectedCellDate) return;

        const title = document.getElementById('quick-desc').value;
        const amount = document.getElementById('quick-amount').value;
        const category = document.getElementById('quick-category').value;
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const origText = submitBtn.textContent;
        submitBtn.textContent = 'Adding...';
        submitBtn.disabled = true;

        try {
            await transactionAPI.add({
                title,
                amount: Number(amount),
                category,
                date: selectedCellDate,
                type: 'expense' // Quick-added transactions defaults to expense
            });
            
            showToast('Transaction added successfully', 'success');
            closeDayModal();
            fetchTransactions(); // Re-render grid
        } catch (error) {
            showToast('Failed to add transaction');
        } finally {
            submitBtn.textContent = origText;
            submitBtn.disabled = false;
        }
    });

    // Fetch transactions from server for currently displayed month
    const fetchTransactions = async () => {
        try {
            // Show Loading Spinner overlay
            loadingSpinner.classList.remove('hidden');

            const year = currentDate.getFullYear();
            const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
            const targetMonth = `${year}-${monthStr}`;

            const groupedData = await transactionAPI.getCalendarMonth(targetMonth);
            transactionsByDay = groupedData || {};
            
            // Build grid
            renderCalendar();
        } catch (error) {
            console.error('Error fetching calendar transactions:', error);
            showToast('Failed to synchronize with ledger service.');
            daysGrid.innerHTML = `
                <div class="col-span-7 text-center py-20 text-rose-500 font-semibold">
                    <span class="text-4xl block mb-2">⚠️</span>
                    <p>Failed to synchronize with ledger service.</p>
                </div>
            `;
        } finally {
            // Hide loading spinner
            loadingSpinner.classList.add('hidden');
        }
    };

    // Init
    fetchTransactions();
});
