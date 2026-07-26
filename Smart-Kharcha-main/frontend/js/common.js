// Utility Functions
export function showToast(message, type = 'error') {
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
    }, 3000);
}

// Make showToast global so inline scripts or old code can use it if needed, though exporting is better
window.showToast = showToast;

export async function loadComponent(url, containerId) {
    try {
        const container = document.getElementById(containerId);
        if (!container) return;
        const response = await fetch(url);
        if (response.ok) {
            const html = await response.text();
            container.innerHTML = html;
        } else {
            console.error(`Failed to load component: ${url}`);
        }
    } catch (error) {
        console.error(`Error loading component: ${url}`, error);
    }
}

/**
 * @deprecated This file is deprecated in Milestone 2.
 * Its logic has been migrated to frontend/js/managers/ (LayoutManager, NotificationManager, ThemeManager)
 */
export async function loadAllComponents() {
    await loadComponent('./components/navbar.html', 'navbar-container');
    await loadComponent('./components/notification-panel.html', 'notification-panel-container');
    await loadComponent('./components/profile-dropdown.html', 'profile-dropdown-container');
    await loadComponent('./components/footer.html', 'footer-container');
    await loadComponent('./components/modals.html', 'modals-container');
    await loadComponent('./components/toast.html', 'toast-container-wrapper');
    // For loader, if we use it globally:
    await loadComponent('./components/loader.html', 'loader-container');
}

export function initCommonUI() {
    // Auth Check
    const token = localStorage.getItem('token');
    if (!token && !window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
        window.location.href = 'index.html';
        return;
    }

    // Set User Name and Email
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            const profileAvatar = document.getElementById('profile-avatar');
            if (profileAvatar) {
                profileAvatar.textContent = (user.name || 'U').charAt(0).toUpperCase();
            }
            const dropdownName = document.getElementById('dropdown-user-name');
            const dropdownEmail = document.getElementById('dropdown-user-email');
            if (dropdownName) dropdownName.textContent = user.name || 'User';
            if (dropdownEmail) dropdownEmail.textContent = user.email || 'user@example.com';
            
            const userNameDisplays = document.querySelectorAll('#user-name-display');
            userNameDisplays.forEach(el => el.textContent = user.name || 'User');
        } catch(e) {}
    }

    // Dynamic Time-Based Greeting
    const updateGreeting = () => {
        const hour = new Date().getHours();
        const greetingHeading = document.getElementById('greeting-heading');
        if (!greetingHeading) return;

        let greetingText = '';
        if (hour < 12) {
            greetingText = '🌅 Good Morning';
        } else if (hour < 18) {
            greetingText = '☀️ Good Afternoon';
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

    // Dark mode logic removed

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
}
