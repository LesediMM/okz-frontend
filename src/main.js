/**
 * src/main.js
 * Entry point for OKZ Sports Frontend - User ID System Ready
 */

import App from './app.js';
import { router } from './router.js';

/**
 * Main Application Bootstrapper
 */
const initApp = async () => {
    // 1. Initialize global application state
    // This checks localStorage for 'okz_user_id' and 'user' data
    await App.init();

    // 2. Initial route handling
    // Load the correct page based on current hash
    await router();

    // 3. Global Event Listeners
    
    // Trigger router whenever the URL hash changes
    window.addEventListener('hashchange', async () => {
        await router();
    });

    /**
     * LOGOUT DELEGATION
     * Since the navbar is re-rendered on every route change, 
     * we attach a single listener to the window to catch logout clicks.
     */
    window.addEventListener('click', e => {
        if (e.target && e.target.id === 'logout-btn') {
            e.preventDefault();
            App.handleLogout();
        }
    });

    console.log('OKZ Sports: Bootstrapping complete.');
};

// Start the app
window.addEventListener('DOMContentLoaded', initApp);