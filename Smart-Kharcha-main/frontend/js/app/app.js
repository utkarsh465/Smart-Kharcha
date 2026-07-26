import state from './state.js';
import ThemeManager from '../managers/ThemeManager.js';
import LayoutManager from '../managers/LayoutManager.js';
import UserManager from '../managers/UserManager.js';
import NotificationManager from '../managers/NotificationManager.js';
import LoaderManager from '../managers/LoaderManager.js';

class App {
    constructor() {
        this.state = state;
        this.theme = ThemeManager;
        this.layout = LayoutManager;
        this.user = UserManager;
        this.notifications = NotificationManager;
        this.loader = LoaderManager;
    }
    
    async initialize() {
        // Initialize independent managers
        this.notifications.initialize();
        this.loader.initialize();
        this.theme.initialize();
        
        // Wait for layout (DOM elements like Navbar need to exist before user/theme attach)
        await this.layout.initialize();
        
        // Now initialize User Manager (which attaches to Navbar)
        this.user.initialize();
        
        // Expose to window for debugging/legacy access
        window.app = this;
    }
}
export default new App();
