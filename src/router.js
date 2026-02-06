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

// Route Map
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
    // 1. Get the current path from the URL hash
    // Example: "#/booking" becomes "/booking"
    const path = window.location.hash.slice(1).toLowerCase() || '/';

    // 2. Find the matching page component or default to Home
    const page = routes[path] || Home;

    // 3. Select the app container
    const appContainer = document.getElementById('app');

    try {
        // 4. Render the page content inside the global layout
        // Each page component is expected to have a .render() method
        const pageHTML = await page.render();
        appContainer.innerHTML = App.renderLayout(pageHTML);

        // 5. Execute post-render logic (event listeners, API calls)
        // Each page component can optionally have an .afterRender() method
        if (page.afterRender) {
            await page.afterRender();
        }

        // Scroll to top on navigation
        window.scrollTo(0, 0);

    } catch (error) {
        console.error('Routing Error:', error);
        appContainer.innerHTML = App.renderLayout(`
            <div class="error-page">
                <h1>Oops!</h1>
                <p>Something went wrong while loading this page.</p>
                <a href="#/">Return Home</a>
            </div>
        `);
    }
};