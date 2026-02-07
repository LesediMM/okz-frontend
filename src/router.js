/**
 * src/router.js
 * SPA Hash-based Router for OKZ Sports - Protected Routes Update
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

// Define which routes require the user to be logged in (User ID system)
const protectedRoutes = ['/booking', '/my-bookings', '/dashboard'];
const adminRoutes = ['/admin/dashboard', '/admin/bookings'];

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

export const router = async () => {
    let path = window.location.hash.slice(1).toLowerCase() || '/';
    if (!path.startsWith('/')) path = '/' + path;

    // --- NAVIGATION GUARD ---
    const userId = localStorage.getItem('okz_user_id');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    // 1. If route is protected and no User ID, redirect to login
    if (protectedRoutes.includes(path) && !userId) {
        window.location.hash = '#/login';
        return;
    }

    // 2. If route is admin and not an admin, redirect to admin login
    if (adminRoutes.includes(path) && !isAdmin) {
        window.location.hash = '#/admin/login';
        return;
    }

    // 3. Find the matching page
    const page = routes[path] || Home;
    const appContainer = document.getElementById('app');

    try {
        // Render inside Layout (Passes current state to Navbar)
        const pageHTML = await page.render();
        appContainer.innerHTML = App.renderLayout(pageHTML);

        // Attach layout events (Logout button)
        if (App.attachLayoutEvents) {
            App.attachLayoutEvents();
        }

        // Execute specific page logic
        if (page.afterRender) {
            await page.afterRender();
        }

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

window.addEventListener('hashchange', router);
window.addEventListener('load', router);