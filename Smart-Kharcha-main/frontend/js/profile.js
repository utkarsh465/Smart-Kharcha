import { userAPI, transactionAPI, getToken } from './api.js';

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

    // Mobile Drawer Navigation Toggles
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

    const formatCurrency = (amount) => {
        return Number(amount).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

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

    // Password Visibility Toggle
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.parentElement.querySelector('input');
            const icon = toggle.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('ph-eye');
                icon.classList.add('ph-eye-closed');
            } else {
                input.type = 'password';
                icon.classList.remove('ph-eye-closed');
                icon.classList.add('ph-eye');
            }
        });
    });

    // Tab Navigation Configuration
    const tabAccountBtn = document.getElementById('tab-account-btn');
    const tabConfigBtn = document.getElementById('tab-config-btn');
    const tabStatsBtn = document.getElementById('tab-stats-btn');

    const sectionAccount = document.getElementById('section-account');
    const sectionConfig = document.getElementById('section-config');
    const sectionStats = document.getElementById('section-stats');

    const resetTabs = () => {
        [tabAccountBtn, tabConfigBtn, tabStatsBtn].forEach(btn => {
            btn.classList.remove('tab-btn-active', 'border-primary');
        });
        [sectionAccount, sectionConfig, sectionStats].forEach(sec => {
            sec.classList.add('hidden');
        });
    };

    tabAccountBtn.addEventListener('click', () => {
        resetTabs();
        tabAccountBtn.classList.add('tab-btn-active', 'border-primary');
        sectionAccount.classList.remove('hidden');
    });

    tabConfigBtn.addEventListener('click', () => {
        resetTabs();
        tabConfigBtn.classList.add('tab-btn-active', 'border-primary');
        sectionConfig.classList.remove('hidden');
    });

    tabStatsBtn.addEventListener('click', () => {
        resetTabs();
        tabStatsBtn.classList.add('tab-btn-active', 'border-primary');
        sectionStats.classList.remove('hidden');
        fetchStatsAndRender();
    });

    // Load Profile details from Backend
    const loadProfileData = async () => {
        try {
            const user = await userAPI.getProfile();
            
            // Map text details
            document.getElementById('profile-name').textContent = user.name || 'User';
            document.getElementById('profile-email').textContent = user.email || 'user@example.com';
            document.getElementById('profile-avatar').textContent = (user.name || 'U').charAt(0).toUpperCase();

            // Populate forms
            document.getElementById('input-profile-name').value = user.name || '';
            document.getElementById('input-profile-email').value = user.email || '';
            
            // Sync user back in local cache
            localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
            console.error('Error fetching profile:', error);
            showToast('Failed to load live profile. Using cache.');
            
            // Cache fallback
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                document.getElementById('profile-name').textContent = user.name || 'User';
                document.getElementById('profile-email').textContent = user.email || 'user@example.com';
                document.getElementById('profile-avatar').textContent = (user.name || 'U').charAt(0).toUpperCase();
                document.getElementById('input-profile-name').value = user.name || '';
                document.getElementById('input-profile-email').value = user.email || '';
            }
        }
    };

    // Load Preferences configs
    const loadPreferences = () => {
        const activeCurrency = localStorage.getItem('currency') || '₹';
        const activeBudget = localStorage.getItem('monthly_budget') || '10000';

        document.getElementById('select-currency').value = activeCurrency;
        document.getElementById('input-budget').value = activeBudget;
    };

    // Submit profile updates to Backend
    document.getElementById('profile-update-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('input-profile-name').value;
        const email = document.getElementById('input-profile-email').value;
        const password = document.getElementById('input-profile-password').value;

        const saveBtn = e.target.querySelector('button[type="submit"]');
        const origText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        const payload = { name, email };
        if (password) payload.password = password;

        try {
            const updated = await userAPI.updateProfile(payload);
            
            showToast('Profile credentials saved successfully!', 'success');
            
            // Reset password field
            document.getElementById('input-profile-password').value = '';

            // Update UI headers
            document.getElementById('profile-name').textContent = updated.name;
            document.getElementById('profile-email').textContent = updated.email;
            document.getElementById('profile-avatar').textContent = updated.name.charAt(0).toUpperCase();

            // Cache Sync
            localStorage.setItem('user', JSON.stringify(updated));
        } catch (error) {
            showToast('Failed to save profile details');
        } finally {
            saveBtn.textContent = origText;
            saveBtn.disabled = false;
        }
    });

    // Preferences form Submission
    document.getElementById('preferences-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const selectedCurrency = document.getElementById('select-currency').value;
        const budgetLimit = document.getElementById('input-budget').value;

        localStorage.setItem('currency', selectedCurrency);
        localStorage.setItem('monthly_budget', budgetLimit);

        showToast('App configurations saved successfully!', 'success');
        
        // Propagate updates
        updateCurrencyDisplay();
    });

    // Calculate historical cashflow stats from Transactions list
    const fetchStatsAndRender = async () => {
        try {
            const data = await transactionAPI.getAll();
            const transactions = data.transactions || data || [];

            let totalInflow = 0;
            let totalOutflow = 0;

            transactions.forEach(t => {
                const amt = Number(t.amount);
                if (t.type === 'income') {
                    totalInflow += amt;
                } else {
                    totalOutflow += amt;
                }
            });

            const totalLogs = transactions.length;
            const totalSum = totalInflow + totalOutflow;
            const avgVal = totalLogs > 0 ? (totalSum / totalLogs) : 0;

            // Render stats on UI
            document.getElementById('stats-total-inflow').textContent = formatCurrency(totalInflow);
            document.getElementById('stats-total-outflow').textContent = formatCurrency(totalOutflow);
            document.getElementById('stats-total-logs').textContent = totalLogs;
            document.getElementById('stats-avg-val').textContent = formatCurrency(avgVal);

            updateCurrencyDisplay();
        } catch (error) {
            console.error('Error fetching statistics:', error);
            showToast('Failed to calculate stats. Database offline.');
        }
    };

    // Load on init
    loadProfileData();
    loadPreferences();
    updateCurrencyDisplay();
});
