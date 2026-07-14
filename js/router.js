/* Router module for navigation between screens */

class Router {
    constructor() {
        this.currentScreen = 'mainMenu';
        this.handlers = {};
    }

    // Register handler for a screen
    register(screenName, handler) {
        this.handlers[screenName] = handler;
    }

    // Navigate to a screen
    navigate(screenName, data = {}) {
        const handler = this.handlers[screenName];
        if (handler) {
            handler(data);
        }
        this.currentScreen = screenName;
    }

    // Get current screen
    getCurrentScreen() {
        return this.currentScreen;
    }
}

// Export (ES6)
export { Router };
