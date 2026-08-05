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
    const tabSecurityBtn = document.getElementById('tab-security-btn');
    const tabStatsBtn = document.getElementById('tab-stats-btn');

    const sectionAccount = document.getElementById('section-account');
    const sectionConfig = document.getElementById('section-config');
    const sectionSecurity = document.getElementById('section-security');
    const sectionStats = document.getElementById('section-stats');

    const resetTabs = () => {
        [tabAccountBtn, tabConfigBtn, tabSecurityBtn, tabStatsBtn].forEach(btn => {
            if (btn) btn.classList.remove('tab-btn-active', 'border-primary');
        });
        [sectionAccount, sectionConfig, sectionSecurity, sectionStats].forEach(sec => {
            if (sec) sec.classList.add('hidden');
        });
    };

    if (tabAccountBtn) {
        tabAccountBtn.addEventListener('click', () => {
            resetTabs();
            tabAccountBtn.classList.add('tab-btn-active', 'border-primary');
            if (sectionAccount) sectionAccount.classList.remove('hidden');
        });
    }

    if (tabConfigBtn) {
        tabConfigBtn.addEventListener('click', () => {
            resetTabs();
            tabConfigBtn.classList.add('tab-btn-active', 'border-primary');
            if (sectionConfig) sectionConfig.classList.remove('hidden');
        });
    }

    if (tabSecurityBtn) {
        tabSecurityBtn.addEventListener('click', () => {
            resetTabs();
            tabSecurityBtn.classList.add('tab-btn-active', 'border-primary');
            if (sectionSecurity) sectionSecurity.classList.remove('hidden');
        });
    }

    if (tabStatsBtn) {
        tabStatsBtn.addEventListener('click', () => {
            resetTabs();
            tabStatsBtn.classList.add('tab-btn-active', 'border-primary');
            if (sectionStats) sectionStats.classList.remove('hidden');
            if (typeof fetchStatsAndRender === 'function') fetchStatsAndRender();
        });
    }

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
            
            const usernameEl = document.getElementById('profile-username');
            if (usernameEl) {
                usernameEl.textContent = user.username || 'user';
            }
            
            // Display Avatar Image if it exists
            const profileAvatarImg = document.getElementById('profile-avatar-img');
            const profileAvatarSpan = document.getElementById('profile-avatar');
            if (user.avatar && profileAvatarImg && profileAvatarSpan) {
                profileAvatarImg.src = `http://localhost:5000${user.avatar}`;
                profileAvatarImg.classList.remove('hidden');
                profileAvatarSpan.classList.add('hidden');
            } else if (profileAvatarSpan) {
                profileAvatarSpan.textContent = (user.name || user.username || 'U').charAt(0).toUpperCase();
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
            if (user.preferences) {
                localStorage.setItem('currency', user.preferences.currency || '₹');
                localStorage.setItem('monthly_budget', user.preferences.budgetLimit || '10000');
                localStorage.setItem('language', user.preferences.appLanguage || 'en');
                localStorage.setItem('notifications', user.preferences.notifications !== false);
            }
            
            // Render Login History and Active Devices
            if (user.loginHistory && user.loginHistory.length > 0) {
                const historyBody = document.getElementById('login-history-body');
                const activeContainer = document.getElementById('active-devices-container');
                
                if (historyBody) {
                    historyBody.innerHTML = '';
                    [...user.loginHistory].reverse().forEach(log => {
                        const dateObj = new Date(log.time);
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td class="px-4 py-3"><div class="flex items-center gap-2"><i class="ph-fill ph-monitor text-slate-400"></i> ${log.device || 'Unknown'} / ${log.os || 'Unknown'}</div></td>
                            <td class="px-4 py-3">${log.browser || 'Unknown'}</td>
                            <td class="px-4 py-3 text-slate-400">${log.ip || 'Unknown'}</td>
                            <td class="px-4 py-3">${dateObj.toLocaleDateString()} <span class="text-slate-400 ml-1">${dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></td>
                        `;
                        historyBody.appendChild(tr);
                    });
                }
                
                if (activeContainer) {
                    const currentLog = user.loginHistory[user.loginHistory.length - 1]; // most recent is last in array
                    activeContainer.innerHTML = `
                        <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
                                <i class="ph-fill ph-laptop text-lg"></i>
                            </div>
                            <div class="flex-1">
                                <p class="text-xs font-bold text-slate-700">Current Session</p>
                                <p class="text-[10px] font-medium text-slate-500">${currentLog.os || 'Unknown OS'} • ${currentLog.browser || 'Unknown Browser'}</p>
                            </div>
                            <div class="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold">Active Now</div>
                        </div>
                    `;
                }
            }

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
        const activeLanguage = localStorage.getItem('language') || 'en';
        const notifications = localStorage.getItem('notifications') !== 'false';

        const currEl = document.getElementById('select-currency');
        if (currEl) currEl.value = activeCurrency;
        
        const budgEl = document.getElementById('input-budget');
        if (budgEl) budgEl.value = activeBudget;
        
        const langEl = document.getElementById('select-language');
        if (langEl) langEl.value = activeLanguage;
        
        const notifEl = document.getElementById('toggle-notifications');
        if (notifEl) notifEl.checked = notifications;
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
            document.getElementById('profile-name').textContent = updated.name || 'User';
            document.getElementById('profile-email').textContent = updated.email || '';
            const usernameEl = document.getElementById('profile-username');
            if (usernameEl) {
                usernameEl.textContent = updated.username || 'user';
            }
            const avatarSpan = document.getElementById('profile-avatar');
            if (avatarSpan) {
                avatarSpan.textContent = (updated.name || updated.username || 'U').charAt(0).toUpperCase();
            }

            // Cache Sync
            localStorage.setItem('user', JSON.stringify(updated));
            
            // Recalculate completion
            calculateProfileCompletion(updated);
            
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            if (typeof showToast !== 'undefined') showToast('Failed to save profile details', 'error');
        } finally {
            saveBtn.textContent = origText;
            saveBtn.disabled = false;
        }
    });

    // Preferences form Submission
    document.getElementById('preferences-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const selectedCurrency = document.getElementById('select-currency').value;
        const budgetLimit = document.getElementById('input-budget').value;
        const language = document.getElementById('select-language').value;
        const darkModeEl = document.getElementById('toggle-dark-mode');
        const darkMode = darkModeEl ? darkModeEl.checked : false;
        
        const notificationsEl = document.getElementById('toggle-notifications');
        const notifications = notificationsEl ? notificationsEl.checked : true;

        const previousLanguage = localStorage.getItem('language');

        localStorage.setItem('currency', selectedCurrency);
        localStorage.setItem('monthly_budget', budgetLimit);
        localStorage.setItem('language', language);

        try {
            await userAPI.updateProfile({
                preferences: {
                    currency: selectedCurrency,
                    budgetLimit: Number(budgetLimit),
                    appLanguage: language,
                    darkMode,
                    notifications
                }
            });
            if (typeof showToast !== 'undefined') showToast('App configurations saved successfully!', 'success');
            
            if (typeof updateCurrencyDisplay !== 'undefined') updateCurrencyDisplay();

            if (previousLanguage !== language) {
                document.cookie = `googtrans=/en/${language}; path=/; domain=${window.location.hostname}`;
                document.cookie = `googtrans=/en/${language}; path=/`;
            }
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Error saving preferences:', error);
            if (typeof showToast !== 'undefined') showToast('Failed to save preferences to server.', 'error');
        }
    });

    // Calculate historical cashflow stats from Transactions list
    const calculateStats = async () => {
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
            
            // Top row stats
            const topTxnsEl = document.getElementById('top-stat-txns');
            if (topTxnsEl) topTxnsEl.textContent = totalLogs;
            const topIncomeEl = document.getElementById('top-stat-income');
            if (topIncomeEl) topIncomeEl.textContent = formatCurrency(totalInflow);
            const topExpenseEl = document.getElementById('top-stat-expense');
            if (topExpenseEl) topExpenseEl.textContent = formatCurrency(totalOutflow);
            const topSavingsEl = document.getElementById('top-stat-savings');
            if (topSavingsEl) topSavingsEl.textContent = formatCurrency(totalInflow - totalOutflow);
            
            const avgEl = document.getElementById('stats-avg-daily') || document.getElementById('stats-avg-val');
            if (avgEl) avgEl.textContent = formatCurrency(avgVal);

            // Financial Health Calculation
            let healthScore = 0;
            if (totalInflow > 0) {
                const ratio = (totalInflow - totalOutflow) / totalInflow;
                if (ratio >= 0.2) healthScore = 100;
                else if (ratio >= 0.1) healthScore = 85;
                else if (ratio >= 0) healthScore = 70;
                else if (ratio >= -0.2) healthScore = 40;
                else healthScore = 20;
            } else if (totalOutflow > 0) {
                healthScore = 10;
            }

            const healthValEl = document.getElementById('profile-health-val');
            const healthRingEl = document.getElementById('profile-health-ring');
            if (healthValEl) healthValEl.textContent = healthScore;
            if (healthRingEl) {
                healthRingEl.style.strokeDasharray = `${healthScore} 100`;
                if (healthScore < 50) {
                    healthRingEl.style.stroke = '#ef4444'; // red
                } else if (healthScore < 80) {
                    healthRingEl.style.stroke = '#f59e0b'; // amber
                } else {
                    healthRingEl.style.stroke = '#10b981'; // emerald
                }
            }

            if (typeof updateCurrencyDisplay !== 'undefined') updateCurrencyDisplay();
        } catch (error) {
            console.error('Error fetching statistics:', error);
            if (typeof showToast !== 'undefined') showToast('Failed to calculate stats. Database offline.');
        }
    };

    // Security Forms & Buttons
    
    // 1. Change Password
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPassword = document.getElementById('input-new-password').value;
            if (!newPassword || newPassword.length < 6) {
                if (typeof showToast !== 'undefined') showToast('Password must be at least 6 characters long.', 'error');
                return;
            }
            
            try {
                await userAPI.updateProfile({ password: newPassword });
                if (typeof showToast !== 'undefined') showToast('Password updated successfully!', 'success');
                passwordForm.reset();
            } catch (error) {
                console.error('Error changing password:', error);
                if (typeof showToast !== 'undefined') showToast('Failed to update password.', 'error');
            }
        });
    }

    // 2. Logout All Devices
    const btnLogoutAll = document.getElementById('btn-logout-all');
    if (btnLogoutAll) {
        btnLogoutAll.addEventListener('click', async () => {
            try {
                await userAPI.logoutAll();
                localStorage.clear();
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Error logging out all devices:', error);
                if (typeof showToast !== 'undefined') showToast('Failed to logout from all devices.', 'error');
            }
        });
    }

    // 3. Delete Account
    const btnDeleteAccount = document.getElementById('btn-delete-account');
    if (btnDeleteAccount) {
        btnDeleteAccount.addEventListener('click', async () => {
            const confirmed = confirm("WARNING: This will permanently delete your account and ALL your financial data. This action CANNOT be undone. Are you absolutely sure?");
            if (confirmed) {
                try {
                    await userAPI.deleteAccount();
                    localStorage.clear();
                    window.location.href = 'login.html';
                } catch (error) {
                    console.error('Error deleting account:', error);
                    if (typeof showToast !== 'undefined') showToast('Failed to delete account.', 'error');
                }
            }
        });
    }

    // Load on init
    loadProfileData();
    loadPreferences();
    updateCurrencyDisplay();
    calculateStats();
});

