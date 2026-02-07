/**
 * src/router.js
 * SPA Hash-based Router for OKZ Sports
 */

import App from './app.js';
import Home from './pages/Home.js';
import UserLogin from './pages/UserLogin.js';
import UserRegister from './pages/UserRegister.js';
import Booking from './pages/Booking.js';
import MyBookings from './pages/MyBookings.js';
import UserDashboard from './pages/UserDashboard.js';
import AdminLogin from './pages/AdminLogin.js';
import AdminDashboard from './pages/AdminDashboard.js';
import AdminBookings from './pages/AdminBookings.js';

// Route Map - Using explicit hash keys to prevent mismatch
const routes = {
    '/': Home,
    '/login': UserLogin,
    '/register': UserRegister,
    '/booking': Booking,
    '/my-bookings': MyBookings,
    '/dashboard': UserDashboard,
    '/admin/login': AdminLogin,
    '/admin/dashboard': AdminDashboard,
    '/admin/bookings': AdminBookings
};

/**
 * Main Router Function
 */
export const router = async () => {
    // 1. Get the current path
    // This logic ensures that "#/booking" becomes "/booking"
    let path = window.location.hash.slice(1).toLowerCase() || '/';
    
    // Safety check: if path doesn't start with /, add it
    if (!path.startsWith('/')) {
        path = '/' + path;
    }

    // 2. Find the matching page
    const page = routes[path] || Home;

    // 3. Select the app container
    const appContainer = document.getElementById('app');

    try {
        // 4. Render the page content inside the global layout
        const pageHTML = await page.render();
        appContainer.innerHTML = App.renderLayout(pageHTML);

        // 5. CRITICAL: Initialize Navbar Events (Logout button, etc.)
        if (App.attachLayoutEvents) {
            App.attachLayoutEvents();
        }

        // 6. EXECUTE PAGE LOGIC (This is what makes the Booking buttons appear!)
        if (page.afterRender) {
            await page.afterRender();
        }

        // Scroll to top
        window.scrollTo(0, 0);

    } catch (error) {
        console.error('Routing Error:', error);
        appContainer.innerHTML = App.renderLayout(`
            <div class="error-page" style="text-align:center; padding: 50px;">
                <h1>Oops!</h1>
                <p>Something went wrong while loading this page.</p>
                <a href="#/">Return Home</a>
            </div>
        `);
    }
};

// Listen for hash changes and page load
window.addEventListener('hashchange', router);
window.addEventListener('load', router);