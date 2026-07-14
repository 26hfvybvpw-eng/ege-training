/* Main entry point for the application */

import { Application } from './app.js';

// Initialize and start the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new Application();
    app.start();
});
