class StateManager {
    constructor() {
        this.state = {
            user: null,
            theme: localStorage.getItem('theme') || 'light',
            transactions: [],
            budget: {},
            calendar: {},
            settings: {},
            notifications: []
        };
        this.listeners = new Map();
    }

    get(key) {
        return this.state[key];
    }

    set(key, value) {
        this.state[key] = value;
        this.notify(key, value);
    }

    update(key, value) {
        this.state[key] = { ...this.state[key], ...value };
        this.notify(key, this.state[key]);
    }

    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push(callback);
    }

    notify(key, value) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(callback => callback(value));
        }
    }
}
export default new StateManager();
