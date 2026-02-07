/**
 * src/router.js
 * FIXED: Syncs App State before rendering to prevent "Stuck" login pages
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

const protectedRoutes = ['/booking', '/my-bookings', '/dashboard'];
const adminRoutes = ['/admin/dashboard', '/admin/bookings'];

export const router = async () => {
    const appContainer = document.getElementById('app');
    
    // 1. Get current path
    let path = window.location.hash.slice(1).toLowerCase() || '/';
    if (!path.startsWith('/')) path = '/' + path;

    // 2. CRITICAL FIX: Sync App State with LocalStorage on every route change
    // This ensures that right after login, App.state.isAuthenticated becomes TRUE
    const userId = localStorage.getItem('okz_user_id');
    const userJson = localStorage.getItem('user');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    if (userId && userJson) {
        App.state.isAuthenticated = true;
        App.state.user = JSON.parse(userJson);
    } else {
        App.state.isAuthenticated = false;
        App.state.user = null;
    }

    // 3. NAVIGATION GUARDS
    // Redirect to login if trying to access protected page while logged out
    if (protectedRoutes.includes(path) && !App.state.isAuthenticated) {
        window.location.hash = '#/login';
        return;
    }

    // Redirect to admin login if unauthorized
    if (adminRoutes.includes(path) && !isAdmin) {
        window.location.hash = '#/admin/login';
        return;
    }

    // 4. FIND AND RENDER PAGE
    const page = routes[path] || Home;

    try {
        // Render page inside the layout
        const pageHTML = await page.render();
        
        // This now uses the UPDATED App.state we synced in step 2
        appContainer.innerHTML = App.renderLayout(pageHTML);

        // Re-bind navbar events (like logout)
        if (App.attachLayoutEvents) {
            App.attachLayoutEvents();
        }

        // Run page-specific logic (afterRender)
        if (page.afterRender) {
            await page.afterRender();
        }

        window.scrollTo(0, 0);
    } catch (error) {
        console.error('Routing Error:', error);
        appContainer.innerHTML = App.renderLayout(`
            <div class="error-page" style="text-align:center; padding: 50px;">
                <h1>Route Error</h1>
                <p>Could not load the requested page.</p>
                <a href="#/">Return Home</a>
            </div>
        `);
    }
};

// Global Listeners
window.addEventListener('hashchange', router);
window.addEventListener('load', router);