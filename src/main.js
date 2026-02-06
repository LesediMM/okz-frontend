/**
 * src/main.js
 * Entry point for OKZ Sports Frontend
 */

import App from './app.js';
import { router } from './router.js';

/**
 * Main Application Bootstrapper
 */
const initApp = async () => {
    // 1. Initialize global application state (Auth check)
    // This calls the backend status endpoint: https://okz.onrender.com/api/v1/login/status
    await App.init();

    // 2. Initial route handling
    // Load the correct page based on the current URL hash (e.g., #/login)
    await router();

    // 3. Global Event Listeners
    
    // Listen for URL hash changes to trigger the router
    window.addEventListener('hashchange', router);

    // Global Logout Listener
    // Since we use event delegation, we listen for clicks on the body
    document.body.addEventListener('click', e => {
        if (e.target.id === 'logout-btn') {
            e.preventDefault();
            App.handleLogout();
        }
    });

    console.log('OKZ Sports: Application fully loaded and routing active.');
};

// Start the app when the DOM is ready
window.addEventListener('DOMContentLoaded', initApp);