class LayoutManager {
    constructor() {
        this.componentsPath = './components/';
    }
    
    async initialize() {
        await this.loadAllComponents();
        this.initMobileMenu();
    }
    
    destroy() {}

    async loadComponent(elementId, componentName) {
        let element = document.getElementById(elementId);
        if (!element) {
            // For global overlays, dynamically create their containers if missing
            if (['footer-container', 'loader-container', 'toast-container', 'notification-panel-container', 'profile-dropdown-container', 'modals-container'].includes(elementId)) {
                element = document.createElement('div');
                element.id = elementId;
                document.body.appendChild(element);
            } else {
                return;
            }
        }
        
        try {
            const response = await fetch(`${this.componentsPath}${componentName}.html`);
            if (response.ok) {
                const html = await response.text();
                element.innerHTML = html;
            } else {
                console.error(`Failed to load component: ${componentName}`);
            }
        } catch (error) {
            console.error(`Error loading component ${componentName}:`, error);
        }
    }

    async loadAllComponents() {
        // Must load navbar first because it contains containers for notifications and profile dropdown
        await this.loadComponent('navbar-container', 'navbar');

        const promises = [
            this.loadComponent('footer-container', 'footer'),
            this.loadComponent('loader-container', 'loader'),
            this.loadComponent('toast-container', 'toast'),
            this.loadComponent('notification-panel-container', 'notification-panel'),
            this.loadComponent('profile-dropdown-container', 'profile-dropdown')
        ];
        
        await Promise.all(promises);
        
        // Setup dropdowns after load
        this.setupDropdowns();
    }

    setupDropdowns() {
        const profileBtn = document.getElementById('profile-dropdown-btn');
        const profileDropdown = document.getElementById('profile-dropdown-box');
        const notifBtn = document.getElementById('notification-bell-btn');
        const notifDrawer = document.getElementById('notification-drawer');
        
        if (profileBtn && profileDropdown) {
            profileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (notifDrawer) notifDrawer.classList.add('hidden');
                profileDropdown.classList.toggle('hidden');
                
                // Add tiny bounce animation on open
                if (!profileDropdown.classList.contains('hidden')) {
                    profileDropdown.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        profileDropdown.style.transition = 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                        profileDropdown.style.transform = 'scale(1)';
                    }, 10);
                }
            });
        }
        
        if (notifBtn && notifDrawer) {
            notifBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (profileDropdown) profileDropdown.classList.add('hidden');
                notifDrawer.classList.toggle('hidden');
            });
        }

        // Close dropdowns when clicking outside
        window.addEventListener('click', (e) => {
            if (profileDropdown && !profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
                profileDropdown.classList.add('hidden');
            }
            if (notifDrawer && !notifDrawer.contains(e.target) && !notifBtn.contains(e.target)) {
                notifDrawer.classList.add('hidden');
            }
        });
    }

    initMobileMenu() {
        // Find existing mobile menu toggles and wire them
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const sidebar = document.getElementById('sidebar');
        const closeSidebarBtn = document.getElementById('close-sidebar');

        if (mobileMenuBtn && sidebar) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.remove('-translate-x-full');
            });
        }

        if (closeSidebarBtn && sidebar) {
            closeSidebarBtn.addEventListener('click', () => {
                sidebar.classList.add('-translate-x-full');
            });
        }
    }
}
export default new LayoutManager();
