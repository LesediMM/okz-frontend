/**
 * src/main.js
 * Entry point - MANUAL NAVIGATION VERSION
 */

import App from './app.js';
import Home from './pages/Home.js';

const initApp = async () => {
    // 1. Initialize state (Checks localStorage for user session)
    await App.init();

    // 2. Manual Initial Load
    // We target the main 'app' div directly
    const root = document.getElementById('app');
    root.innerHTML = Home.render();
    if (Home.afterRender) await Home.afterRender();

    // 3. Global Logout Listener
    window.addEventListener('click', e => {
        if (e.target && e.target.id === 'logout-btn') {
            e.preventDefault();
            App.handleLogout(); // Ensure this function clears localStorage and calls Home.render()
        }
    });

    console.log('OKZ Sports: Manual Bootstrapping complete.');
};

window.addEventListener('DOMContentLoaded', initApp);