import { transactionAPI, getToken } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (!getToken()) {
        window.location.href = 'index.html';
        return;
    }

    // Set User Profile Display in drawers
    const userStr = localStorage.getItem('user');
    
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
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

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
        if (type === 'income') return 'bg-emerald-100 text-emerald-600';
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

    // Calendar state
    let transactions = [];
    let currentDate = new Date(); // Tracks visible month
    let selectedCellDate = null; // YYYY-MM-DD for modal quick add

    // DOM references
    const daysGrid = document.getElementById('calendar-days-grid');
    const monthYearEl = document.getElementById('calendar-month-year');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    
    const monthExpenseTotalEl = document.getElementById('month-expense-total');
    const monthIncomeTotalEl = document.getElementById('month-income-total');
    const monthDaysActiveEl = document.getElementById('month-days-active');
    const monthPeakSpendingEl = document.getElementById('month-peak-spending');

    // Build the grid UI
    const renderCalendar = () => {
        const currencySymbol = getCurrencySymbol();
        daysGrid.innerHTML = '';
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth(); // 0-indexed (0=Jan, 11=Dec)
        
        // Month and Year label
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        monthYearEl.textContent = `${monthNames[month]} ${year}`;

        // Get bounds
        const firstDayIndex = new Date(year, month, 1).getDay(); // Weekday starting (0-6)
        const totalDays = new Date(year, month + 1, 0).getDate(); // Days in current month
        const prevMonthTotalDays = new Date(year, month, 0).getDate(); // Days in previous month

        // Gather transaction mapping for current visible month
        const transactionsByDay = {};
        transactions.forEach(t => {
            const tDate = new Date(t.date);
            const dateStr = tDate.toISOString().split('T')[0];
            if (!transactionsByDay[dateStr]) {
                transactionsByDay[dateStr] = [];
            }
            transactionsByDay[dateStr].push(t);
        });

        // 1. Render Days of Previous Month (padding)
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const dayNum = prevMonthTotalDays - i;
            const cell = document.createElement('div');
            cell.className = 'calendar-cell bg-slate-50/50 p-2 text-slate-400 border-b border-r border-slate-100 flex flex-col justify-between opacity-50';
            cell.innerHTML = `<span class="text-xs font-semibold select-none">${dayNum}</span>`;
            daysGrid.appendChild(cell);
        }

        // 2. Render Current Month Days
        const todayStr = new Date().toISOString().split('T')[0];
        
        for (let day = 1; day <= totalDays; day++) {
            const dateObj = new Date(year, month, day);
            // Timezone offset correction to match YYYY-MM-DD correctly
            const yearStr = dateObj.getFullYear();
            const monthStr = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dayStr = String(dateObj.getDate()).padStart(2, '0');
            const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

            const isToday = dateStr === todayStr;
            const dayTransactions = transactionsByDay[dateStr] || [];

            const cell = document.createElement('div');
            cell.className = `calendar-cell p-2 border-b border-r border-slate-200 bg-white hover:bg-indigo-50/30 cursor-pointer flex flex-col justify-between transition-all`;
            
            if (isToday) {
                cell.classList.add('ring-2', 'ring-primary', 'ring-inset', 'z-10');
            }

            // Compute totals for badges
            let dailyExpense = 0;
            let dailyIncome = 0;
            dayTransactions.forEach(t => {
                if (t.type === 'expense') dailyExpense += Number(t.amount);
                else dailyIncome += Number(t.amount);
            });

            let badgeHtml = '';
            if (dailyExpense > 0 && dailyIncome > 0) {
                badgeHtml = `
                    <div class="flex flex-col gap-0.5 text-[9px] font-bold text-right truncate">
                        <span class="text-emerald-600 bg-emerald-50 px-1 rounded">+${currencySymbol}${Math.round(dailyIncome)}</span>
                        <span class="text-rose-500 bg-rose-50 px-1 rounded">-${currencySymbol}${Math.round(dailyExpense)}</span>
                    </div>
                `;
            } else if (dailyExpense > 0) {
                badgeHtml = `
                    <div class="text-right text-[10px] font-extrabold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md inline-block self-end truncate">
                        -${currencySymbol}${Math.round(dailyExpense)}
                    </div>
                `;
            } else if (dailyIncome > 0) {
                badgeHtml = `
                    <div class="text-right text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md inline-block self-end truncate">
                        +${currencySymbol}${Math.round(dailyIncome)}
                    </div>
                `;
            }

            cell.innerHTML = `
                <div class="flex justify-between items-center">
                    <span class="text-xs md:text-sm font-bold ${isToday ? 'text-primary' : 'text-slate-700'}">${day}</span>
                    ${dayTransactions.length > 0 ? `<span class="w-1.5 h-1.5 bg-primary rounded-full md:hidden"></span>` : ''}
                </div>
                <div class="hidden md:block w-full">
                    ${badgeHtml}
                </div>
            `;

            // Click interaction opens detail popup
            cell.addEventListener('click', () => {
                openDayModal(dateStr, dateObj, dayTransactions);
            });

            daysGrid.appendChild(cell);
        }

        // 3. Render Next Month Days to pad remaining cells
        const renderedCount = firstDayIndex + totalDays;
        const totalGridCells = 42; // standard 6 rows x 7 cols
        const paddingNext = totalGridCells - renderedCount;
        
        for (let day = 1; day <= paddingNext; day++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell bg-slate-50/50 p-2 text-slate-400 border-b border-r border-slate-100 flex flex-col justify-between opacity-50';
            cell.innerHTML = `<span class="text-xs font-semibold select-none">${day}</span>`;
            daysGrid.appendChild(cell);
        }

        // 4. Update Summary Statistics for currently visible month
        calculateMonthStats(year, month);
    };

    // Calculate month stats
    const calculateMonthStats = (year, month) => {
        let totalExpense = 0;
        let totalIncome = 0;
        const activeDays = new Set();
        const dailyExpenses = {};

        transactions.forEach(t => {
            const tDate = new Date(t.date);
            if (tDate.getFullYear() === year && tDate.getMonth() === month) {
                const dateKey = tDate.toISOString().split('T')[0];
                const amt = Number(t.amount);
                
                if (t.type === 'expense') {
                    totalExpense += amt;
                    dailyExpenses[dateKey] = (dailyExpenses[dateKey] || 0) + amt;
                } else {
                    totalIncome += amt;
                }
                activeDays.add(dateKey);
            }
        });

        // Set labels
        monthExpenseTotalEl.textContent = formatCurrency(totalExpense);
        monthIncomeTotalEl.textContent = formatCurrency(totalIncome);
        monthDaysActiveEl.textContent = activeDays.size;

        // Find peak spending day
        let peakDate = null;
        let peakAmt = 0;
        
        Object.keys(dailyExpenses).forEach(dateStr => {
            if (dailyExpenses[dateStr] > peakAmt) {
                peakAmt = dailyExpenses[dateStr];
                peakDate = dateStr;
            }
        });

        if (peakDate) {
            const options = { month: 'short', day: 'numeric' };
            const formatted = new Date(peakDate).toLocaleDateString('en-IN', options);
            monthPeakSpendingEl.textContent = `${formatted} (${getCurrencySymbol()}${Math.round(peakAmt)})`;
        } else {
            monthPeakSpendingEl.textContent = 'None';
        }
    };

    // Navigation triggers
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
        updateCurrencyDisplay();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
        updateCurrencyDisplay();
    });

    // Day Details Modal Controls
    const dayModal = document.getElementById('day-modal');
    const closeDayModalBtn = document.getElementById('close-day-modal-btn');
    const dayTransactionsList = document.getElementById('day-transactions-list');
    const dayModalTitle = document.getElementById('day-modal-title');
    const dayModalDate = document.getElementById('day-modal-date');

    const openDayModal = (dateStr, dateObj, dayTransactions) => {
        selectedCellDate = dateStr;
        
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dayModalTitle.textContent = 'Transactions';
        dayModalDate.textContent = dateObj.toLocaleDateString('en-IN', options);
        
        // Reset quick add form desc
        document.getElementById('quick-desc').value = '';
        document.getElementById('quick-amount').value = '';
        document.getElementById('quick-category').value = 'Food';

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

    // Render list inside day modal
    const renderDayTransactions = (list) => {
        dayTransactionsList.innerHTML = '';
        const currencySymbol = getCurrencySymbol();

        if (list.length === 0) {
            dayTransactionsList.innerHTML = `
                <div class="text-center py-6 text-slate-400">
                    <i class="ph ph-receipt text-3xl mb-2 inline-block"></i>
                    <p class="text-xs font-semibold">No transactions logged on this day.</p>
                </div>
            `;
            return;
        }

        list.forEach(t => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/50 rounded-2xl';
            
            const isExpense = t.type === 'expense';
            const iconClass = getCategoryIcon(t.category);
            const colorClass = getCategoryColor(t.category, t.type);
            const amountPrefix = isExpense ? '-' : '+';
            const amountColor = isExpense ? 'text-slate-800' : 'text-emerald-600';

            item.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}">
                        <i class="ph ${iconClass} text-xl"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-slate-800 text-xs md:text-sm">${t.title}</h4>
                        <span class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">${t.category}</span>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="font-extrabold font-heading text-xs md:text-sm ${amountColor}">${amountPrefix}${currencySymbol}${formatCurrency(t.amount)}</span>
                    <button class="delete-day-t-btn p-1 text-slate-400 hover:text-danger hover:bg-slate-100 rounded-lg transition-colors" data-id="${t._id}">
                        <i class="ph ph-trash text-base"></i>
                    </button>
                </div>
            `;
            dayTransactionsList.appendChild(item);
        });

        // Day list delete listener
        document.querySelectorAll('.delete-day-t-btn').forEach(btn => {
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

    // Quick Add on Day Form Submit
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

    // Fetch transactions from server
    const fetchTransactions = async () => {
        try {
            const data = await transactionAPI.getAll();
            transactions = data.transactions || data || [];
            
            // Build grid
            renderCalendar();
            
            // Sync currency
            updateCurrencyDisplay();
        } catch (error) {
            console.error('Error fetching calendar transactions:', error);
            showToast('Failed to load transaction data');
            daysGrid.innerHTML = `
                <div class="col-span-7 text-center py-20 text-rose-500 font-semibold">
                    <i class="ph ph-warning-circle text-4xl mb-2 inline-block"></i>
                    <p>Failed to synchronize with ledger service.</p>
                </div>
            `;
        }
    };

    // Init
    fetchTransactions();
});
