import { transactionAPI } from './api.js';
import { loadAllComponents, initCommonUI, showToast } from './common.js';

// Application State for Transactions
const state = {
    search: '',
    type: 'all',
    category: 'all',
    date: 'all', // 'all', 'today', 'yesterday', '7days', '30days', 'thisMonth', 'lastMonth'
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
    startDate: null,
    endDate: null
};

let currentDeleteId = null;
let deleteTimeout = null;

const categoryIcons = {
    'Food': 'ph-hamburger',
    'Travel': 'ph-airplane',
    'Shopping': 'ph-shopping-bag',
    'Medical': 'ph-first-aid',
    'Bills': 'ph-receipt',
    'Entertainment': 'ph-popcorn',
    'Education': 'ph-graduation-cap',
    'Salary': 'ph-money',
    'Others': 'ph-dots-three-circle'
};

const categoryColors = {
    'Food': 'text-orange-500 bg-orange-50',
    'Travel': 'text-blue-500 bg-blue-50',
    'Shopping': 'text-purple-500 bg-purple-50',
    'Medical': 'text-red-500 bg-red-50',
    'Bills': 'text-yellow-600 bg-yellow-50',
    'Entertainment': 'text-pink-500 bg-pink-50',
    'Education': 'text-indigo-500 bg-indigo-50',
    'Salary': 'text-emerald-500 bg-emerald-50',
    'Others': 'text-slate-500 bg-slate-50'
};

document.addEventListener('DOMContentLoaded', async () => {
    await loadAllComponents();
    initCommonUI();

    // Highlight nav item (assume navbar has an ID like nav-transactions)
    const navTransactions = document.getElementById('nav-transactions');
    if (navTransactions) {
        navTransactions.classList.add('bg-indigo-50', 'text-primary');
        navTransactions.classList.remove('text-slate-600', 'hover:bg-slate-50');
    }

    initEventListeners();
    await fetchAnalytics();
    await fetchAndRender();
});

function initEventListeners() {
    // Filter & Search Inputs
    const searchInput = document.getElementById('search-input');
    let searchDebounce;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => {
            state.search = e.target.value;
            state.page = 1; // Reset to page 1
            fetchAndRender();
        }, 500);
    });

    document.getElementById('filter-type').addEventListener('change', (e) => {
        state.type = e.target.value;
        state.page = 1;
        fetchAndRender();
    });

    document.getElementById('filter-category').addEventListener('change', (e) => {
        state.category = e.target.value;
        state.page = 1;
        fetchAndRender();
    });

    document.getElementById('filter-date').addEventListener('change', (e) => {
        const val = e.target.value;
        state.date = val;
        
        // Calculate start/end dates
        const today = new Date();
        today.setHours(0,0,0,0);
        let start = null;
        let end = null;

        switch(val) {
            case 'today':
                start = new Date(today);
                end = new Date(today);
                break;
            case 'yesterday':
                start = new Date(today);
                start.setDate(start.getDate() - 1);
                end = new Date(start);
                break;
            case '7days':
                start = new Date(today);
                start.setDate(start.getDate() - 7);
                end = new Date();
                break;
            case '30days':
                start = new Date(today);
                start.setDate(start.getDate() - 30);
                end = new Date();
                break;
            case 'thisMonth':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'lastMonth':
                start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                end = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
        }

        state.startDate = start ? start.toISOString().split('T')[0] : null;
        state.endDate = end ? end.toISOString().split('T')[0] : null;
        state.page = 1;
        fetchAndRender();
    });

    document.getElementById('sort-by').addEventListener('change', (e) => {
        const [by, order] = e.target.value.split('-');
        state.sortBy = by;
        state.sortOrder = order;
        state.page = 1;
        fetchAndRender();
    });

    document.getElementById('clear-filters-btn').addEventListener('click', () => {
        document.getElementById('search-input').value = '';
        document.getElementById('filter-type').value = 'all';
        document.getElementById('filter-category').value = 'all';
        document.getElementById('filter-date').value = 'all';
        document.getElementById('sort-by').value = 'date-desc';
        
        state.search = '';
        state.type = 'all';
        state.category = 'all';
        state.date = 'all';
        state.startDate = null;
        state.endDate = null;
        state.sortBy = 'date';
        state.sortOrder = 'desc';
        state.page = 1;
        
        fetchAndRender();
    });

    // Pagination
    document.getElementById('items-per-page').addEventListener('change', (e) => {
        state.limit = parseInt(e.target.value);
        state.page = 1;
        fetchAndRender();
    });

    document.getElementById('page-prev').addEventListener('click', () => {
        if (state.page > 1) {
            state.page--;
            fetchAndRender();
        }
    });

    document.getElementById('page-next').addEventListener('click', () => {
        // Upper bound handled in render logic
        state.page++;
        fetchAndRender();
    });

    // Modals & Actions
    document.querySelectorAll('.close-edit-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('edit-tx-modal').classList.add('hidden');
        });
    });

    document.getElementById('close-receipt-modal').addEventListener('click', () => {
        const modal = document.getElementById('receipt-modal');
        modal.classList.add('opacity-0');
        setTimeout(() => modal.classList.add('hidden'), 300);
    });

    document.getElementById('edit-tx-form').addEventListener('submit', handleSaveTransaction);

    // New Transaction button (Reuses edit modal)
    document.getElementById('new-transaction-btn').addEventListener('click', () => {
        document.getElementById('edit-tx-form').reset();
        document.getElementById('edit-id').value = '';
        document.getElementById('modal-title').textContent = 'New Transaction';
        // Set date to today by default
        document.getElementById('edit-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('edit-tx-modal').classList.remove('hidden');
    });

    // Exports
    document.getElementById('export-print-btn').addEventListener('click', () => {
        window.print();
    });
    
    document.getElementById('export-csv-btn').addEventListener('click', exportCSV);
}

async function fetchAnalytics() {
    try {
        const data = await transactionAPI.getAnalytics();
        
        // Process data
        let totalIncome = 0;
        let totalExpense = 0;
        let totalTxns = 0;

        data.allTimeStats.forEach(stat => {
            if (stat._id === 'income') {
                totalIncome = stat.total;
                totalTxns += stat.count;
            } else if (stat._id === 'expense') {
                totalExpense = stat.total;
                totalTxns += stat.count;
            }
        });

        document.getElementById('stat-total-txns').textContent = totalTxns.toLocaleString();
        document.getElementById('stat-total-income').textContent = totalIncome.toLocaleString();
        document.getElementById('stat-total-expense').textContent = totalExpense.toLocaleString();

        if (data.categoryStats && data.categoryStats.length > 0) {
            document.getElementById('stat-top-category').textContent = data.categoryStats[0]._id;
        } else {
            document.getElementById('stat-top-category').textContent = 'None';
        }

    } catch (error) {
        console.error("Error fetching analytics:", error);
    }
}

async function fetchAndRender() {
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const listWrapper = document.getElementById('transactions-wrapper');
    const list = document.getElementById('transactions-list');
    
    loadingState.classList.remove('hidden');

    try {
        const params = {
            search: state.search,
            type: state.type,
            category: state.category,
            startDate: state.startDate,
            endDate: state.endDate,
            sortBy: state.sortBy,
            sortOrder: state.sortOrder,
            page: state.page,
            limit: state.limit
        };

        const response = await transactionAPI.getAdvanced(params);
        
        list.innerHTML = '';
        
        if (response.transactions.length === 0) {
            emptyState.classList.remove('hidden');
            listWrapper.classList.add('hidden');
        } else {
            emptyState.classList.add('hidden');
            listWrapper.classList.remove('hidden');
            response.transactions.forEach(tx => list.appendChild(createTransactionHTML(tx)));
        }

        renderPagination(response.pagination);
        
        // Also refresh analytics to keep them fresh
        fetchAnalytics();

    } catch (error) {
        showToast('Error loading transactions', 'error');
        console.error(error);
    } finally {
        loadingState.classList.add('hidden');
    }
}

function createTransactionHTML(tx) {
    const li = document.createElement('li');
    li.className = `group bg-white border border-slate-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${tx.isPinned ? 'border-l-4 border-l-warning' : ''}`;
    li.dataset.id = tx._id;

    const isExpense = tx.type === 'expense';
    const amtColor = isExpense ? 'text-rose-500' : 'text-emerald-500';
    const amtPrefix = isExpense ? '-' : '+';
    
    const catIcon = categoryIcons[tx.category] || categoryIcons['Others'];
    const catColor = categoryColors[tx.category] || categoryColors['Others'];

    const dateStr = new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    let tagsHtml = '';
    if (tx.tags && tx.tags.length > 0) {
        tagsHtml = tx.tags.map(tag => `<span class="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] uppercase font-bold rounded-md">${tag}</span>`).join('');
    }

    li.innerHTML = `
        <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${catColor}">
                <i class="ph-fill ${catIcon}"></i>
            </div>
            <div>
                <h4 class="font-heading font-bold text-slate-800 text-lg flex items-center gap-2">
                    ${tx.title} 
                    ${tx.isPinned ? '<i class="ph-fill ph-push-pin text-warning text-sm" title="Pinned"></i>' : ''}
                </h4>
                <div class="text-xs font-medium text-slate-500 flex items-center gap-2 mt-0.5 flex-wrap">
                    <span>${dateStr}</span> &bull; 
                    <span class="capitalize">${tx.paymentMethod || 'Cash'}</span>
                    ${tagsHtml ? `&bull; ${tagsHtml}` : ''}
                </div>
                ${tx.description ? `<p class="text-xs text-slate-400 mt-1 truncate max-w-sm">${tx.description}</p>` : ''}
            </div>
        </div>
        <div class="flex items-center justify-between md:justify-end gap-6 md:w-1/3">
            <div class="text-right flex-1">
                <span class="font-heading text-lg font-extrabold ${amtColor}">${amtPrefix}₹${tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                <span class="block text-[10px] uppercase tracking-wider font-extrabold ${isExpense ? 'text-rose-400' : 'text-emerald-400'} mt-0.5">${tx.type}</span>
            </div>
            
            <div class="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity no-print">
                ${tx.receiptImage ? `
                <button class="btn-receipt p-2 text-slate-400 hover:text-primary hover:bg-indigo-50 rounded-lg transition-colors" title="View Receipt">
                    <i class="ph-bold ph-receipt text-lg"></i>
                </button>
                ` : ''}
                <div class="dropdown relative inline-block text-left">
                    <button class="p-2 text-slate-400 hover:text-primary hover:bg-indigo-50 rounded-lg transition-colors">
                        <i class="ph-bold ph-dots-three-vertical text-lg"></i>
                    </button>
                    <div class="dropdown-content absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-slate-100 z-10 overflow-hidden">
                        <button class="btn-edit w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-primary flex items-center gap-2"><i class="ph-bold ph-pencil-simple"></i> Edit</button>
                        <button class="btn-pin w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-amber-50 hover:text-warning flex items-center gap-2"><i class="ph-bold ph-push-pin"></i> ${tx.isPinned ? 'Unpin' : 'Pin'}</button>
                        <button class="btn-duplicate w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"><i class="ph-bold ph-copy"></i> Duplicate</button>
                        <div class="border-t border-slate-100 my-1"></div>
                        <button class="btn-delete w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"><i class="ph-bold ph-trash"></i> Delete</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Event Listeners for actions
    const q = (sel) => li.querySelector(sel);
    if(q('.btn-receipt')) {
        q('.btn-receipt').addEventListener('click', () => viewReceipt(tx.receiptImage));
    }
    q('.btn-edit').addEventListener('click', () => openEditModal(tx));
    q('.btn-pin').addEventListener('click', () => togglePin(tx._id));
    q('.btn-duplicate').addEventListener('click', () => duplicateTx(tx._id));
    q('.btn-delete').addEventListener('click', () => initiateDelete(tx._id, li));

    return li;
}

function renderPagination(pagination) {
    const { total, page, limit, totalPages } = pagination;
    
    document.getElementById('page-prev').disabled = page <= 1;
    document.getElementById('page-next').disabled = page >= totalPages;

    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    
    document.getElementById('page-range').textContent = total === 0 ? '0 - 0' : `${start} - ${end}`;
    document.getElementById('page-total').textContent = total;

    const numbersContainer = document.getElementById('page-numbers');
    numbersContainer.innerHTML = '';

    // Simple pagination layout
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
            const btn = document.createElement('button');
            btn.textContent = i;
            if (i === page) {
                btn.className = 'w-7 h-7 rounded-lg bg-primary text-white text-xs font-bold';
            } else {
                btn.className = 'w-7 h-7 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-primary text-xs font-bold transition-colors';
                btn.addEventListener('click', () => {
                    state.page = i;
                    fetchAndRender();
                });
            }
            numbersContainer.appendChild(btn);
        } else if (i === page - 2 || i === page + 2) {
            const span = document.createElement('span');
            span.textContent = '...';
            span.className = 'text-slate-400 text-xs font-bold px-1';
            numbersContainer.appendChild(span);
        }
    }
}


// --- Actions --- //

async function togglePin(id) {
    try {
        await transactionAPI.pin(id);
        fetchAndRender();
    } catch (e) {
        showToast('Error pinning transaction', 'error');
    }
}

async function duplicateTx(id) {
    try {
        await transactionAPI.duplicate(id);
        showToast('Transaction duplicated', 'success');
        fetchAndRender();
    } catch (e) {
        showToast('Error duplicating transaction', 'error');
    }
}

function viewReceipt(base64Image) {
    if (!base64Image) return;
    const modal = document.getElementById('receipt-modal');
    const preview = document.getElementById('receipt-img-preview');
    const downloadBtn = document.getElementById('download-receipt-btn');
    
    preview.src = base64Image;
    downloadBtn.href = base64Image;
    
    modal.classList.remove('hidden');
    // slight delay to allow display:block before fading in
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
}

function openEditModal(tx) {
    document.getElementById('modal-title').textContent = 'Edit Transaction';
    document.getElementById('edit-id').value = tx._id;
    document.getElementById('edit-type').value = tx.type;
    document.getElementById('edit-amount').value = tx.amount;
    document.getElementById('edit-title').value = tx.title;
    document.getElementById('edit-description').value = tx.description || '';
    document.getElementById('edit-category').value = tx.category;
    document.getElementById('edit-payment').value = tx.paymentMethod || 'cash';
    document.getElementById('edit-date').value = tx.date ? new Date(tx.date).toISOString().split('T')[0] : '';
    document.getElementById('edit-tags').value = (tx.tags || []).join(', ');
    document.getElementById('edit-receipt').value = ''; // Cannot easily prepopulate file input

    document.getElementById('edit-tx-modal').classList.remove('hidden');
}

async function handleSaveTransaction(e) {
    e.preventDefault();
    const btn = document.getElementById('save-tx-btn');
    btn.innerHTML = '<i class="ph-bold ph-spinner-gap animate-spin"></i> Saving...';
    btn.disabled = true;

    try {
        const id = document.getElementById('edit-id').value;
        const tagsInput = document.getElementById('edit-tags').value;
        const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);
        
        const payload = {
            type: document.getElementById('edit-type').value,
            amount: parseFloat(document.getElementById('edit-amount').value),
            title: document.getElementById('edit-title').value,
            description: document.getElementById('edit-description').value,
            category: document.getElementById('edit-category').value,
            paymentMethod: document.getElementById('edit-payment').value,
            date: document.getElementById('edit-date').value,
            tags: tags
        };

        // Handle Image
        const fileInput = document.getElementById('edit-receipt');
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            payload.receiptImage = await convertFileToBase64(file);
        }

        if (id) {
            await transactionAPI.update(id, payload);
            showToast('Transaction updated successfully', 'success');
        } else {
            await transactionAPI.add(payload);
            showToast('Transaction added successfully', 'success');
        }

        document.getElementById('edit-tx-modal').classList.add('hidden');
        fetchAndRender();

    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.innerHTML = 'Save Changes';
        btn.disabled = false;
    }
}

function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function initiateDelete(id, liElement) {
    // Hide the element temporarily
    liElement.style.opacity = '0.5';
    liElement.style.pointerEvents = 'none';

    if (deleteTimeout) clearTimeout(deleteTimeout);
    
    // Clear any existing undo toasts
    const container = document.getElementById('toast-container');
    container.innerHTML = ''; 

    const toast = document.createElement('div');
    toast.className = 'flex items-center gap-4 px-5 py-3 rounded-xl shadow-xl text-white text-sm transform transition-all duration-300 pointer-events-auto z-50 bg-slate-800 animate-fade-up';
    
    toast.innerHTML = `
        <i class="ph-fill ph-trash text-rose-500 text-xl"></i>
        <div class="flex flex-col flex-1">
            <span class="font-bold">Transaction Deleted</span>
            <span class="text-xs text-slate-300">It will be permanently removed in 5s</span>
        </div>
        <button id="undo-btn" class="bg-slate-700 hover:bg-slate-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs uppercase tracking-wider transition-colors">Undo</button>
    `;
    
    container.appendChild(toast);

    let isUndone = false;
    
    toast.querySelector('#undo-btn').addEventListener('click', () => {
        isUndone = true;
        liElement.style.opacity = '1';
        liElement.style.pointerEvents = 'auto';
        toast.remove();
        showToast('Deletion undone', 'success');
    });

    deleteTimeout = setTimeout(async () => {
        if (!isUndone) {
            try {
                await transactionAPI.delete(id);
                fetchAndRender();
                if (toast.parentNode) toast.remove();
            } catch (err) {
                showToast('Error deleting', 'error');
                liElement.style.opacity = '1';
                liElement.style.pointerEvents = 'auto';
            }
        }
    }, 5000);
}

// Simple Export CSV
async function exportCSV() {
    try {
        // Fetch all matching without limit for export
        const params = {
            search: state.search,
            type: state.type,
            category: state.category,
            startDate: state.startDate,
            endDate: state.endDate,
            sortBy: state.sortBy,
            sortOrder: state.sortOrder,
            limit: 10000 // A large number to get all for CSV
        };
        const response = await transactionAPI.getAdvanced(params);
        const data = response.transactions;

        if (data.length === 0) {
            showToast('No data to export', 'warning');
            return;
        }

        const headers = ['Date', 'Title', 'Description', 'Category', 'Type', 'Amount', 'Payment Method', 'Tags'];
        const csvRows = [];
        csvRows.push(headers.join(','));

        data.forEach(tx => {
            const row = [
                new Date(tx.date).toISOString().split('T')[0],
                `"${(tx.title || '').replace(/"/g, '""')}"`,
                `"${(tx.description || '').replace(/"/g, '""')}"`,
                tx.category,
                tx.type,
                tx.amount,
                tx.paymentMethod || 'cash',
                `"${(tx.tags || []).join(' ')}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        showToast('CSV Exported', 'success');

    } catch (e) {
        showToast('Export failed', 'error');
    }
}
