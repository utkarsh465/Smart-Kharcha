import state from '../app/state.js';

class UserManager {
    constructor() {}
    
    initialize() {
        this.loadUser();
        
        state.subscribe('user', (user) => {
            this.updateUI(user);
        });
        
        // Use a timeout to ensure LayoutManager has injected navbar
        setTimeout(() => {
            this.updateUI(state.get('user'));
            
            // Attach global logout handlers
            document.querySelectorAll('.logout-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = 'login.html';
                });
            });
        }, 500);
    }
    
    loadUser() {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                state.set('user', user);
            }
        } catch (e) {
            console.error('Failed to parse user from localStorage', e);
        }
    }
    
    updateUI(user) {
        if (!user) return;
        
        // Navbar Avatar
        const avatarElement = document.getElementById('navbar-avatar');
        if (avatarElement) {
            const initials = this.getInitials(user.name);
            avatarElement.innerHTML = `
                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold shadow-md transform hover:scale-105 transition-transform duration-200 border-2 border-white cursor-pointer">
                    ${initials}
                </div>
            `;
        }
        
        // Profile Dropdown
        const dropdownName = document.getElementById('dropdown-user-name');
        const dropdownEmail = document.getElementById('dropdown-user-email');
        if (dropdownName) dropdownName.textContent = user.name || 'User';
        if (dropdownEmail) dropdownEmail.textContent = user.email || '';
        
        // Dashboard Greeting
        const greetingHeading = document.getElementById('greeting-heading');
        if (greetingHeading) {
            const hour = new Date().getHours();
            let greeting = 'Good Night';
            if (hour >= 5 && hour < 12) greeting = '☀️ Good Morning';
            else if (hour >= 12 && hour < 17) greeting = '🌤️ Good Afternoon';
            else if (hour >= 17 && hour < 21) greeting = '🌇 Good Evening';
            else greeting = '🌙 Good Night';
            
            greetingHeading.innerHTML = `${greeting}, <span id="user-name-display" class="text-primary">${user.name || 'User'}</span>`;
        }
    }

    getInitials(name) {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    }
    
    destroy() {}
}
export default new UserManager();
