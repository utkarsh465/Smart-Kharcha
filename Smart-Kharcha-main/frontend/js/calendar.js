import app from './app/app.js';
import { transactionAPI, getToken } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    await app.initialize();

    const navCalendar = document.getElementById('nav-calendar');
    if (navCalendar) {
        navCalendar.classList.add('bg-indigo-50', 'text-primary');
        navCalendar.classList.remove('text-slate-500', 'hover:bg-slate-50', 'hover:text-primary');
    }

    // Auth Check
    if (!getToken()) {
        window.location.href = 'index.html';
        return;
    }

    // Logout logic handled by UserManager
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
        const container = document.getElementById('toast-container-wrapper');
        if (!container) return;
        let innerContainer = document.getElementById('toast-container');
        if(!innerContainer) {
             innerContainer = document.createElement('div');
             innerContainer.id = 'toast-container';
             innerContainer.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col gap-2 z-50 pointer-events-none';
             container.appendChild(innerContainer);
        }

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
        
        innerContainer.appendChild(toast);
        setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
        
        setTimeout(() => {
            toast.classList.add('translate-y-2', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Currency Settings Helper
    const getCurrencySymbol = () => localStorage.getItem('currency') || '₹';
    const formatCurrency = (amount) => Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    // Category mapping icons and color badges
    const getCategoryIcon = (category) => {
        const icons = {
            'Food': '🍔', 'Transport': '🚗', 'Travel': '🚗', 'Shopping': '🛍', 'Medical': '💊',
            'Bills': '📄', 'Salary': '💰', 'Entertainment': '🎮', 'Education': '📚', 'Other': '📌'
        };
        return icons[category] || '📌';
    };

    const getCategoryBadgeClass = (category) => {
        const colors = {
            'Food': 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
            'Transport': 'bg-blue-50 text-blue-700 border-blue-200/60',
            'Travel': 'bg-blue-50 text-blue-700 border-blue-200/60',
            'Shopping': 'bg-purple-50 text-purple-700 border-purple-200/60',
            'Medical': 'bg-rose-50 text-rose-700 border-rose-200/60',
            'Bills': 'bg-amber-50 text-amber-700 border-amber-200/60',
            'Entertainment': 'bg-pink-50 text-pink-700 border-pink-200/60',
            'Education': 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
            'Salary': 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
            'Other': 'bg-slate-50 text-slate-700 border-slate-200/60'
        };
        return (colors[category] || colors['Other']) + ' border';
    };

    // Calendar state
    const monthCache = {}; // Cache fetched months data
    let transactionsByDay = {}; // Key: YYYY-MM-DD -> { expense, income, transactions: [] }
    let currentDate = new Date(); 
    let selectedCellDate = null; 
    let activeFilter = 'all'; // 'all', 'type:expense', 'type:income', 'cat:Food', etc.
    let searchQuery = '';

    // DOM references
    const daysGrid = document.getElementById('calendar-days-grid');
    const monthYearEl = document.getElementById('calendar-month-year');
    const loadingSpinner = document.getElementById('calendar-loading-spinner');
    const searchInput = document.getElementById('calendar-search');
    
    // Stats elements
    const statExpense = document.getElementById('month-expense-total');
    const statIncome = document.getElementById('month-income-total');
    const statNetSavings = document.getElementById('month-net-savings');
    const statTxnCount = document.getElementById('month-transactions-count');
    const statPeakSpend = document.getElementById('month-peak-spending');
    const statPeakInc = document.getElementById('month-peak-income');
    const statAvgExp = document.getElementById('month-avg-daily-expense');
    const statBudget = document.getElementById('month-budget-remaining');
    
    // Analytics elements
    const anaCat = document.getElementById('analytic-high-cat');
    const anaWeek = document.getElementById('analytic-high-week');
    const anaWeekend = document.getElementById('analytic-high-weekend');
    const anaAvgWk = document.getElementById('analytic-avg-weekday');
    const anaAvgWkend = document.getElementById('analytic-avg-weekend');
    const anaFreq = document.getElementById('analytic-freq');

    // Tippy instances
    let tippyInstances = [];

    // Main Render Calendar
    const renderCalendar = () => {
        const currencySymbol = getCurrencySymbol();
        daysGrid.innerHTML = '';
        
        // Destroy existing tippy tooltips
        tippyInstances.forEach(t => t.destroy());
        tippyInstances = [];
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth(); 
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        monthYearEl.textContent = `${monthNames[month]} ${year}`;

        let firstDayIndex = new Date(year, month, 1).getDay();
        firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Mon-first

        const totalDays = new Date(year, month + 1, 0).getDate(); 
        const prevMonthTotalDays = new Date(year, month, 0).getDate(); 

        // Calc max daily expense for heatmap
        let maxDailyExpense = 0;
        Object.values(transactionsByDay).forEach(dayObj => {
            if (dayObj.expense > maxDailyExpense) maxDailyExpense = dayObj.expense;
        });

        let todayDateStrLocal = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`;

        // 1. Prev Month Padding
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const cell = createPaddingCell(prevMonthTotalDays - i);
            daysGrid.appendChild(cell);
        }

        // 2. Current Month Days
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === todayDateStrLocal;
            
            // Get data & apply filters
            let rawData = transactionsByDay[dateStr] || { expense: 0, income: 0, transactions: [] };
            let filteredTxns = rawData.transactions.filter(t => {
                let matchFilter = true;
                if (activeFilter.startsWith('type:')) {
                    matchFilter = t.type === activeFilter.split(':')[1];
                } else if (activeFilter.startsWith('cat:')) {
                    matchFilter = t.category === activeFilter.split(':')[1];
                }
                let matchSearch = true;
                if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    matchSearch = t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || String(t.amount).includes(q) || (t.description && t.description.toLowerCase().includes(q));
                }
                return matchFilter && matchSearch;
            });

            // Recompute day stats based on filtered txns
            let dExp = 0, dInc = 0;
            filteredTxns.forEach(t => {
                if(t.type === 'expense') dExp += Number(t.amount);
                else dInc += Number(t.amount);
            });

            const hasTxn = filteredTxns.length > 0;
            const isWeekend = new Date(year, month, day).getDay() === 0 || new Date(year, month, day).getDay() === 6;

            const cell = document.createElement('div');
            cell.className = `calendar-cell p-2 border-b border-r border-slate-200 hover:scale-[1.02] hover:shadow-lg hover:z-10 cursor-pointer flex flex-col justify-between transition-all duration-300 relative`;
            
            // Base background
            if(isWeekend) cell.classList.add('bg-slate-50/50');
            else cell.classList.add('bg-white');

            // Today Highlight
            if (isToday) cell.classList.add('ring-2', 'ring-primary', 'ring-inset', 'z-20');

            // Search highlight
            if (searchQuery && hasTxn) {
                cell.classList.add('bg-yellow-50', 'border-yellow-300');
            }

            // Heatmap & Status colors
            let statusDot = '';
            let amountHtml = '';

            if (hasTxn && !searchQuery) { // Don't override search highlight with heatmap if searching
                if (dExp > 0 && dInc > 0) {
                    cell.classList.add('border-purple-300');
                    statusDot = `<span class="w-2 h-2 rounded-full bg-purple-500"></span>`;
                } else if (dInc > 0 && dExp === 0) {
                    cell.classList.add('border-emerald-300', 'bg-emerald-50/30');
                    statusDot = `<span class="w-2 h-2 rounded-full bg-emerald-500"></span>`;
                } else if (dExp > 0) {
                    // Heatmap logic for expenses
                    const intensity = dExp / maxDailyExpense;
                    if (intensity > 0.66) {
                        cell.classList.add('border-rose-400', 'bg-rose-100/50');
                    } else if (intensity > 0.33) {
                        cell.classList.add('border-rose-300', 'bg-rose-50/50');
                    } else {
                        cell.classList.add('border-rose-200');
                    }
                    statusDot = `<span class="w-2 h-2 rounded-full bg-rose-500"></span>`;
                }
            }

            // Daily Total display
            if (dExp > 0) {
                amountHtml = `<div class="text-right text-[10px] md:text-xs font-bold text-rose-500 truncate mt-1">${currencySymbol}${formatCurrency(dExp)}</div>`;
            } else if (dInc > 0) {
                amountHtml = `<div class="text-right text-[10px] md:text-xs font-bold text-emerald-500 truncate mt-1">+${currencySymbol}${formatCurrency(dInc)}</div>`;
            }

            cell.innerHTML = `
                <div class="flex justify-between items-start w-full">
                    <span class="text-xs md:text-sm font-bold ${isToday ? 'text-primary' : 'text-slate-700'}">${day}</span>
                    <div class="flex gap-1">${statusDot}</div>
                </div>
                <div class="w-full text-right">${amountHtml}</div>
            `;

            // Hover Tooltip content
            if (hasTxn && window.tippy) {
                let tooltipHtml = `<div class="p-1 min-w-[150px]"><div class="text-xs font-bold border-b border-slate-600 pb-1 mb-1">${new Date(year, month, day).toLocaleDateString('en-IN', {month:'short', day:'numeric'})}</div>`;
                filteredTxns.slice(0, 4).forEach(t => {
                    const cColor = t.type === 'expense' ? 'text-rose-400' : 'text-emerald-400';
                    tooltipHtml += `<div class="flex justify-between text-[11px] my-1 gap-4">
                        <span class="truncate">${getCategoryIcon(t.category)} ${t.title}</span>
                        <span class="${cColor} font-bold">${currencySymbol}${formatCurrency(t.amount)}</span>
                    </div>`;
                });
                if (filteredTxns.length > 4) {
                    tooltipHtml += `<div class="text-[10px] text-slate-400 text-center mt-1">+${filteredTxns.length - 4} more</div>`;
                }
                tooltipHtml += `</div>`;
                
                tippyInstances.push(tippy(cell, {
                    content: tooltipHtml,
                    allowHTML: true,
                    theme: 'translucent',
                    placement: 'auto',
                    arrow: true,
                    animation: 'scale'
                }));
            }

            // Interactions
            cell.addEventListener('click', (e) => {
                openDayModal(dateStr, new Date(year, month, day), filteredTxns, {exp: dExp, inc: dInc});
            });
            
            cell.addEventListener('dblclick', (e) => {
                e.preventDefault();
                openQuickAdd(dateStr);
            });
            
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                openQuickAdd(dateStr);
            });

            daysGrid.appendChild(cell);
        }

        // 3. Next Month Padding
        const renderedCount = firstDayIndex + totalDays;
        const totalRows = Math.ceil(renderedCount / 7);
        const paddingNext = (totalRows * 7) - renderedCount;
        for (let day = 1; day <= paddingNext; day++) {
            daysGrid.appendChild(createPaddingCell(day));
        }

        // 4. Update Stats & Analytics
        calculateMonthStats();
    };

    const createPaddingCell = (dayNum) => {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell bg-slate-50/40 p-2 text-slate-400 border-b border-r border-slate-100 flex flex-col justify-between opacity-40 select-none';
        cell.innerHTML = `<span class="text-xs font-semibold">${dayNum}</span>`;
        return cell;
    };

    // Calculate Month & Analytics Stats
    const calculateMonthStats = () => {
        let totalExpense = 0, totalIncome = 0, totalTxns = 0;
        let peakExpDay = null, peakExpAmt = 0;
        let peakIncDay = null, peakIncAmt = 0;
        
        let catTotals = {};
        let weekTotals = [0,0,0,0,0,0]; // Up to 6 weeks max
        let weekendExp = 0, weekendDays = 0;
        let weekdayExp = 0, weekdayDays = 0;

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dateObj = new Date(year, month, day);
            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
            const weekNum = Math.floor((day + new Date(year, month, 1).getDay() - 1) / 7);

            if(isWeekend) weekendDays++;
            else weekdayDays++;

            let rawData = transactionsByDay[dateStr] || { expense: 0, income: 0, transactions: [] };
            
            // Apply current filters to stats logic
            let filteredTxns = rawData.transactions.filter(t => {
                if (activeFilter.startsWith('type:')) return t.type === activeFilter.split(':')[1];
                if (activeFilter.startsWith('cat:')) return t.category === activeFilter.split(':')[1];
                return true;
            });

            if(searchQuery) {
                const q = searchQuery.toLowerCase();
                filteredTxns = filteredTxns.filter(t => t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
            }

            let dExp = 0, dInc = 0;
            filteredTxns.forEach(t => {
                totalTxns++;
                if (t.type === 'expense') {
                    dExp += t.amount;
                    catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
                    weekTotals[weekNum] += t.amount;
                    if(isWeekend) weekendExp += t.amount;
                    else weekdayExp += t.amount;
                } else {
                    dInc += t.amount;
                }
            });

            totalExpense += dExp;
            totalIncome += dInc;

            if (dExp > peakExpAmt) { peakExpAmt = dExp; peakExpDay = dateObj; }
            if (dInc > peakIncAmt) { peakIncAmt = dInc; peakIncDay = dateObj; }
        }

        const currencySymbol = getCurrencySymbol();
        const fmtOptions = { month: 'short', day: 'numeric' };

        statExpense.textContent = formatCurrency(totalExpense);
        statIncome.textContent = formatCurrency(totalIncome);
        statNetSavings.textContent = formatCurrency(totalIncome - totalExpense);
        statTxnCount.textContent = totalTxns;
        
        statAvgExp.textContent = formatCurrency(totalExpense / daysInMonth);
        statPeakSpend.textContent = peakExpDay ? `${peakExpDay.toLocaleDateString('en-IN', fmtOptions)}` : 'None';
        statPeakInc.textContent = peakIncDay ? `${peakIncDay.toLocaleDateString('en-IN', fmtOptions)}` : 'None';
        
        // Budget logic (default 10000 for demo)
        const budgetLimit = 10000;
        statBudget.textContent = formatCurrency(budgetLimit - totalExpense);

        // Analytics Update
        let highCat = 'None', highCatAmt = 0;
        Object.entries(catTotals).forEach(([cat, amt]) => {
            if(amt > highCatAmt) { highCatAmt = amt; highCat = cat; }
        });
        
        let highWeek = 1, highWeekAmt = 0;
        weekTotals.forEach((amt, i) => {
            if(amt > highWeekAmt) { highWeekAmt = amt; highWeek = i + 1; }
        });

        anaCat.textContent = highCat !== 'None' ? `${getCategoryIcon(highCat)} ${highCat}` : 'None';
        anaWeek.textContent = highWeekAmt > 0 ? `Week ${highWeek}` : 'None';
        anaWeekend.textContent = weekendExp > 0 ? `${currencySymbol}${formatCurrency(weekendExp)}` : 'None';
        
        anaAvgWk.textContent = formatCurrency(weekdayDays > 0 ? weekdayExp / weekdayDays : 0);
        anaAvgWkend.textContent = formatCurrency(weekendDays > 0 ? weekendExp / weekendDays : 0);
        anaFreq.textContent = totalTxns > 0 ? `${(totalTxns / daysInMonth).toFixed(1)} / day` : '0';
    };

    // Modal Handlers
    const dayModal = document.getElementById('day-modal');
    const dayModalDate = document.getElementById('day-modal-date');
    const dModInc = document.getElementById('day-modal-income');
    const dModExp = document.getElementById('day-modal-expense');
    const dModNet = document.getElementById('day-modal-net');
    const dayTransactionsList = document.getElementById('day-transactions-list');

    const openDayModal = (dateStr, dateObj, txns, totals) => {
        selectedCellDate = dateStr;
        dayModalDate.textContent = dateObj.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        const cSym = getCurrencySymbol();
        dModInc.textContent = `${cSym}${formatCurrency(totals.inc)}`;
        dModExp.textContent = `${cSym}${formatCurrency(totals.exp)}`;
        dModNet.textContent = `${cSym}${formatCurrency(totals.inc - totals.exp)}`;
        
        // Reset quick form
        document.getElementById('quick-desc').value = '';
        document.getElementById('quick-amount').value = '';
        document.getElementById('quick-category').value = 'Food';

        renderDayTransactions(txns);

        dayModal.classList.remove('hidden');
        setTimeout(() => {
            dayModal.classList.remove('opacity-0');
            dayModal.querySelector('.transform').classList.remove('scale-95');
        }, 10);
    };

    const closeDayModal = () => {
        dayModal.classList.add('opacity-0');
        dayModal.querySelector('.transform').classList.add('scale-95');
        setTimeout(() => dayModal.classList.add('hidden'), 300);
    };

    document.getElementById('close-day-modal-btn').addEventListener('click', closeDayModal);
    dayModal.addEventListener('click', e => { if (e.target === dayModal) closeDayModal(); });
    window.addEventListener('keydown', e => { if (e.key === 'Escape' && !dayModal.classList.contains('hidden')) closeDayModal(); });

    const openQuickAdd = (dateStr) => {
        selectedCellDate = dateStr;
        document.getElementById('quick-desc').value = '';
        document.getElementById('quick-amount').value = '';
        
        let rawData = transactionsByDay[dateStr] || { expense: 0, income: 0, transactions: [] };
        const [y, m, d] = dateStr.split('-');
        openDayModal(dateStr, new Date(y, m-1, d), rawData.transactions, {exp: rawData.expense, inc: rawData.income});
        setTimeout(() => document.getElementById('quick-amount').focus(), 300);
    };

    document.getElementById('fab-add-txn').addEventListener('click', () => {
        const todayStr = new Date().toISOString().split('T')[0];
        openQuickAdd(todayStr);
    });

    const renderDayTransactions = (list) => {
        dayTransactionsList.innerHTML = '';
        const cSym = getCurrencySymbol();

        if (list.length === 0) {
            dayTransactionsList.innerHTML = `<div class="text-center py-8 text-slate-400"><span class="text-4xl block mb-2">📌</span><p class="text-xs font-semibold">No transactions found.</p></div>`;
            return;
        }

        list.forEach(t => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/50 rounded-2xl hover:bg-slate-100 transition-colors';
            
            const isExp = t.type === 'expense';
            const badgeClass = getCategoryBadgeClass(t.category);
            const timeStr = t.date ? new Date(t.date).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12:true}) : '12:00 PM';

            item.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg ${badgeClass}">${getCategoryIcon(t.category)}</div>
                    <div>
                        <h4 class="font-bold text-slate-800 text-sm">${t.title}</h4>
                        <div class="flex items-center gap-1.5 mt-0.5">
                            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${badgeClass}">${t.category}</span>
                            <span class="text-[9px] text-slate-400 font-semibold">${timeStr}</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="font-extrabold font-heading text-sm ${isExp ? 'text-slate-800' : 'text-emerald-600'}">${isExp ? '-' : '+'}${cSym}${formatCurrency(t.amount)}</span>
                    <button class="delete-txn-btn p-1.5 text-slate-400 hover:text-danger hover:bg-rose-50 rounded-lg transition-colors focus:outline-none" data-id="${t._id}">
                        <i class="ph ph-trash text-base"></i>
                    </button>
                </div>
            `;
            dayTransactionsList.appendChild(item);
        });

        dayTransactionsList.querySelectorAll('.delete-txn-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Delete this transaction?')) {
                    try {
                        await transactionAPI.delete(btn.getAttribute('data-id'));
                        showToast('Transaction deleted', 'success');
                        closeDayModal();
                        forceRefetch(); 
                    } catch (e) { showToast('Error deleting'); }
                }
            });
        });
    };

    // Quick Add Submit
    document.getElementById('quick-add-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        const orig = btn.textContent;
        btn.textContent = '...'; btn.disabled = true;

        try {
            await transactionAPI.add({
                title: document.getElementById('quick-desc').value,
                amount: Number(document.getElementById('quick-amount').value),
                category: document.getElementById('quick-category').value,
                date: selectedCellDate,
                type: 'expense' 
            });
            showToast('Added successfully', 'success');
            closeDayModal();
            forceRefetch();
        } catch (err) {
            showToast('Failed to add');
        } finally {
            btn.textContent = orig; btn.disabled = false;
        }
    });

    // Fetch Core
    const fetchTransactions = async (force = false) => {
        const targetMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (!force && monthCache[targetMonth]) {
            transactionsByDay = monthCache[targetMonth];
            renderCalendar();
            return;
        }

        loadingSpinner.classList.remove('hidden');
        try {
            const data = await transactionAPI.getCalendarMonth(targetMonth);
            transactionsByDay = data || {};
            monthCache[targetMonth] = transactionsByDay; // Cache it
            renderCalendar();
        } catch (error) {
            showToast('Failed to load calendar data');
        } finally {
            loadingSpinner.classList.add('hidden');
        }
    };
    const forceRefetch = () => { fetchTransactions(true); };

    // Navigation
    document.getElementById('prev-month-btn').addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); fetchTransactions(); });
    document.getElementById('next-month-btn').addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); fetchTransactions(); });

    // Filters & Search
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderCalendar();
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active', 'bg-slate-800', 'text-white');
                if(!b.classList.contains('bg-white')) b.classList.add('bg-white');
            });
            
            const target = e.currentTarget;
            target.classList.add('active', 'bg-slate-800', 'text-white');
            target.classList.remove('bg-white', 'text-slate-600', 'text-slate-700', 'text-emerald-700', 'text-blue-700', 'text-purple-700', 'text-rose-700', 'text-amber-700');
            
            activeFilter = target.getAttribute('data-filter');
            renderCalendar();
        });
    });

    // Export & Print (Bonus)
    document.getElementById('print-btn').addEventListener('click', () => window.print());
    
    document.getElementById('export-pdf-btn').addEventListener('click', () => {
        if(!window.jspdf) return showToast('PDF library loading, try again');
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Smart Kharcha - Expense Report`, 14, 22);
        doc.setFontSize(11);
        doc.text(`Month: ${monthYearEl.textContent}`, 14, 32);
        
        let y = 45;
        Object.keys(transactionsByDay).sort().forEach(date => {
            const data = transactionsByDay[date];
            if(data.transactions.length > 0) {
                doc.setFont(undefined, 'bold');
                doc.text(date, 14, y);
                doc.setFont(undefined, 'normal');
                y += 6;
                data.transactions.forEach(t => {
                    doc.text(`${t.title} (${t.category}): ${t.type==='expense'?'-':'+'}${t.amount}`, 20, y);
                    y += 6;
                    if(y > 280) { doc.addPage(); y = 20; }
                });
                y += 4;
            }
        });
        doc.save(`Expenses_${monthYearEl.textContent.replace(' ', '_')}.pdf`);
        showToast('PDF Exported!', 'success');
    });

    document.getElementById('export-csv-btn').addEventListener('click', () => {
        if(!window.Papa) return showToast('CSV library loading, try again');
        let csvData = [];
        Object.values(transactionsByDay).forEach(data => {
            data.transactions.forEach(t => {
                csvData.push({ Date: new Date(t.date).toISOString().split('T')[0], Title: t.title, Category: t.category, Type: t.type, Amount: t.amount });
            });
        });
        if(csvData.length === 0) return showToast('No data to export', 'warning');
        
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Expenses_${monthYearEl.textContent.replace(' ', '_')}.csv`;
        link.click();
        showToast('CSV Exported!', 'success');
    });

    // Init
    fetchTransactions();
});
