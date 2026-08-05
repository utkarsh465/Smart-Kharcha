import state from '../app/state.js';

class ThemeManager {
    constructor() {
        this.html = document.documentElement;
    }
    
    initialize() {
        // Apply initial theme from state
        this.applyTheme(state.get('theme'));
        
        // Listen to state changes for theme
        state.subscribe('theme', (newTheme) => {
            this.applyTheme(newTheme);
        });
        
        // Setup toggle listeners if they exist in the DOM
        this.setupToggles();
        
        // Use a MutationObserver or just interval to attach to dynamically loaded navbar
        this.attachToNavbar();
    }
    
    applyTheme(theme) {
        if (theme === 'dark') {
            this.html.classList.add('dark');
            document.body.style.backgroundColor = '#0f172a'; // tailwind slate-900
            document.body.style.color = '#f8fafc';
        } else {
            this.html.classList.remove('dark');
            document.body.style.backgroundColor = ''; 
            document.body.style.color = '';
        }
        localStorage.setItem('theme', theme);
    }
    
    toggleTheme() {
        const currentTheme = state.get('theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        state.set('theme', newTheme);
    }

    setupToggles() {
        document.querySelectorAll('.theme-toggle').forEach(btn => {
            btn.addEventListener('click', () => this.toggleTheme());
        });
    }

    attachToNavbar() {
        // Wait a bit for LayoutManager to finish loading components
        setTimeout(() => {
            this.setupToggles();
            
            // Re-attach if dropdown is opened (since it might have toggle inside)
            const profileBtn = document.getElementById('profile-menu-btn');
            if (profileBtn) {
                profileBtn.addEventListener('click', () => {
                    setTimeout(() => this.setupToggles(), 50);
                });
            }
        }, 500);
    }
    
    destroy() {}
}
export default new ThemeManager();
