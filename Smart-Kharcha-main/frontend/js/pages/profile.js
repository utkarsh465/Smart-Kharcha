import app from '../app/app.js';
import { userAPI } from '../services/profileService.js';
import { transactionAPI } from '../services/transactionService.js';
import { getToken } from '../services/api.js';

document.addEventListener('DOMContentLoaded', async () => {
    await app.initialize();

    const navProfile = document.getElementById('nav-profile');
    if (navProfile) {
        navProfile.classList.add('bg-indigo-50', 'text-primary');
        navProfile.classList.remove('text-slate-500', 'hover:bg-slate-50', 'hover:text-primary');
    }

    const getCurrencySymbol = () => localStorage.getItem('currency') || ',1';
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

    // Avatar Upload Logic
    const avatarTrigger = document.getElementById('avatar-upload-trigger');
    const avatarInput = document.getElementById('input-avatar-upload');
    const avatarImg = document.getElementById('profile-avatar-img');
    const avatarSpan = document.getElementById('profile-avatar');

    if (avatarTrigger && avatarInput) {
        avatarTrigger.addEventListener('click', () => {
            avatarInput.click();
        });

        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('avatar', file);

            try {
                const res = await userAPI.uploadAvatar(formData);
                if (typeof showToast !== 'undefined') showToast('Profile photo updated successfully!', 'success');
                
                if (res.avatar) {
                    avatarImg.src = `http://localhost:5000${res.avatar}`;
                    avatarImg.classList.remove('hidden');
                    avatarSpan.classList.add('hidden');
                    
                    const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
                    cachedUser.avatar = res.avatar;
                    localStorage.setItem('user', JSON.stringify(cachedUser));
                    
                    if (typeof calculateProfileCompletion === 'function') {
                        calculateProfileCompletion(cachedUser);
                    }
                }
            } catch (error) {
                console.error('Avatar upload error:', error);
                if (typeof showToast !== 'undefined') showToast(error.message || 'Failed to upload photo', 'error');
            }
        });
    }

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

    // Check URL params for specific tab selection
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tab') === 'settings') {
        tabConfigBtn.click();
    }

    // Load Profile details from Backend
    const loadProfileData = async () => {
        try {
            const user = await userAPI.getProfile();
            
            // Map text details
            document.getElementById('profile-name').textContent = user.name || 'User';
            document.getElementById('profile-email').textContent = user.email || 'user@example.com';
            
            // Display Avatar Image if it exists
            const profileAvatarImg = document.getElementById('profile-avatar-img');
            const profileAvatarSpan = document.getElementById('profile-avatar');
            if (user.avatar && profileAvatarImg && profileAvatarSpan) {
                profileAvatarImg.src = `http://localhost:5000${user.avatar}`;
                profileAvatarImg.classList.remove('hidden');
                profileAvatarSpan.classList.add('hidden');
            } else if (profileAvatarSpan) {
                profileAvatarSpan.textContent = (user.name || 'U').charAt(0).toUpperCase();
                if (profileAvatarImg) profileAvatarImg.classList.add('hidden');
                profileAvatarSpan.classList.remove('hidden');
            }

            // Additional details in header
            if (user.createdAt) {
                const memberSince = new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
                document.getElementById('profile-member-since').textContent = memberSince;
            }
            if (user.lastLogin) {
                const lastLoginStr = new Date(user.lastLogin).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
                const lastLoginEl = document.getElementById('profile-last-login');
                if(lastLoginEl) lastLoginEl.textContent = lastLoginStr;
            }
            if (user.accountStatus) {
                const statusEl = document.getElementById('profile-account-status');
                if(statusEl) statusEl.textContent = user.accountStatus;
            }

            // Populate forms
            document.getElementById('input-profile-name').value = user.name || '';
            document.getElementById('input-profile-email').value = user.email || '';
            document.getElementById('input-profile-username').value = user.username || '';
            document.getElementById('input-profile-phone').value = user.phone || '';
            if (user.dob) {
                document.getElementById('input-profile-dob').value = new Date(user.dob).toISOString().split('T')[0];
            }
            document.getElementById('input-profile-gender').value = user.gender || '';
            document.getElementById('input-profile-occupation').value = user.occupation || '';
            document.getElementById('input-profile-country').value = user.country || '';
            document.getElementById('input-profile-city').value = user.city || '';
            
            // Sync user back in local cache
            localStorage.setItem('user', JSON.stringify(user));
            
            // Calculate completion percentage
            calculateProfileCompletion(user);
            
        } catch (error) {
            console.error('Error fetching profile:', error);
            showToast('Failed to load live profile. Using cache.');
            
            // Cache fallback
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                document.getElementById('profile-name').textContent = user.name || 'User';
                document.getElementById('profile-email').textContent = user.email || 'user@example.com';
                
                const profileAvatarImg = document.getElementById('profile-avatar-img');
                const profileAvatarSpan = document.getElementById('profile-avatar');
                if (user.avatar && profileAvatarImg && profileAvatarSpan) {
                    profileAvatarImg.src = `http://localhost:5000${user.avatar}`;
                    profileAvatarImg.classList.remove('hidden');
                    profileAvatarSpan.classList.add('hidden');
                } else if (profileAvatarSpan) {
                    profileAvatarSpan.textContent = (user.name || 'U').charAt(0).toUpperCase();
                    if (profileAvatarImg) profileAvatarImg.classList.add('hidden');
                    profileAvatarSpan.classList.remove('hidden');
                }
                
                document.getElementById('input-profile-name').value = user.name || '';
                document.getElementById('input-profile-email').value = user.email || '';
                document.getElementById('input-profile-username').value = user.username || '';
                document.getElementById('input-profile-phone').value = user.phone || '';
                document.getElementById('input-profile-gender').value = user.gender || '';
                document.getElementById('input-profile-occupation').value = user.occupation || '';
                document.getElementById('input-profile-country').value = user.country || '';
                document.getElementById('input-profile-city').value = user.city || '';
                
                calculateProfileCompletion(user);
            }
        }
    };

    const calculateProfileCompletion = (user) => {
        // Define fields to check for completion
        const fieldsToCheck = ['name', 'email', 'avatar', 'username', 'phone', 'dob', 'gender', 'occupation', 'country', 'city'];
        let filledCount = 0;

        fieldsToCheck.forEach(field => {
            if (user[field] && String(user[field]).trim() !== '') {
                filledCount++;
            }
        });

        const percentage = Math.round((filledCount / fieldsToCheck.length) * 100);
        
        // Update UI
        const completionValEl = document.getElementById('profile-completion-val');
        const completionRingEl = document.getElementById('profile-completion-ring');
        const alertEl = document.getElementById('profile-missing-alert');
        
        if (completionValEl) completionValEl.textContent = `${percentage}%`;
        if (completionRingEl) {
            // Circle circumference for r=15.9 is approx 100
            completionRingEl.style.strokeDasharray = `${percentage} 100`;
            
            // Color based on completion
            if (percentage < 50) {
                completionRingEl.style.stroke = '#ef4444'; // Red
            } else if (percentage < 100) {
                completionRingEl.style.stroke = '#f59e0b'; // Amber
            } else {
                completionRingEl.style.stroke = '#10b981'; // Emerald
            }
        }
        
        if (alertEl) {
            if (percentage < 100) {
                alertEl.classList.remove('hidden');
                alertEl.classList.add('flex');
            } else {
                alertEl.classList.add('hidden');
                alertEl.classList.remove('flex');
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
        const username = document.getElementById('input-profile-username').value;
        const phone = document.getElementById('input-profile-phone').value;
        const dob = document.getElementById('input-profile-dob').value;
        const gender = document.getElementById('input-profile-gender').value;
        const occupation = document.getElementById('input-profile-occupation').value;
        const country = document.getElementById('input-profile-country').value;
        const city = document.getElementById('input-profile-city').value;
        
        const password = document.getElementById('input-profile-password') ? document.getElementById('input-profile-password').value : '';

        const saveBtn = e.target.querySelector('button[type="submit"]');
        const origText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        const payload = { 
            name, 
            email, 
            username, 
            phone, 
            dob: dob || undefined, 
            gender, 
            occupation, 
            country, 
            city 
        };
        if (password) payload.password = password;

        try {
            const updated = await userAPI.updateProfile(payload);
            
            showToast('Profile credentials saved successfully!', 'success');
            
            // Reset password field if it exists
            const pwdInput = document.getElementById('input-profile-password');
            if (pwdInput) pwdInput.value = '';

            // Update UI headers
            document.getElementById('profile-name').textContent = updated.name;
            document.getElementById('profile-email').textContent = updated.email;
            document.getElementById('profile-avatar').textContent = updated.name.charAt(0).toUpperCase();

            // Cache Sync
            localStorage.setItem('user', JSON.stringify(updated));
            
            // Recalculate completion
            calculateProfileCompletion(updated);
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

