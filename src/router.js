/**
 * src/router.js
 * Router for OKZ Sports Frontend
 */

// Import App from same directory
import App from './app.js';

// Import all page components from pages directory
import Home from './pages/Home.js';
import UserLogin from './pages/UserLogin.js';
import UserRegister from './pages/UserRegister.js';
import Booking from './pages/Booking.js';
import MyBookings from './pages/MyBookings.js';
import UserDashboard from './pages/UserDashboard.js';
import AdminLogin from './pages/AdminLogin.js';
import AdminDashboard from './pages/AdminDashboard.js';
import AdminBookings from './pages/AdminBookings.js';

// Route definitions
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

// Protected routes require authentication
const protectedRoutes = ['/booking', '/my-bookings', '/dashboard'];

// Admin routes require admin role
const adminRoutes = ['/admin/dashboard', '/admin/bookings'];

// Main router function
export const router = async () => {
    const appContainer = document.getElementById('app');
    
    if (!appContainer) {
        console.error('App container not found!');
        return;
    }
    
    // 1. Get current path from hash
    let path = window.location.hash.slice(1).toLowerCase() || '/';
    if (!path.startsWith('/')) {
        path = '/' + path;
    }

    // 2. Initialize app state (reads from localStorage)
    await App.init();

    // 3. Navigation guards
    // Redirect to login if accessing protected route without authentication
    if (protectedRoutes.includes(path) && !App.state.isAuthenticated) {
        window.location.hash = '#/login';
        return;
    }

    // Redirect to admin login if accessing admin route without admin role
    if (adminRoutes.includes(path)) {
        const isAdmin = App.state.user?.role === 'admin';
        if (!isAdmin) {
            window.location.hash = '#/admin/login';
            return;
        }
    }

    // 4. Get the page component for the current route
    const page = routes[path] || Home;

    try {
        // Render the page
        const pageHTML = await page.render();
        
        // Wrap page in layout and insert into DOM
        appContainer.innerHTML = App.renderLayout(pageHTML);

        // Attach layout events (like logout button)
        App.attachLayoutEvents();

        // Run page-specific JavaScript (if any)
        if (page.afterRender) {
            await page.afterRender();
        }

        // Scroll to top on route change
        window.scrollTo(0, 0);
        
    } catch (error) {
        console.error('Routing Error:', error);
        
        // Show error page
        appContainer.innerHTML = App.renderLayout(`
            <div class="error-page" style="text-align:center; padding: 50px;">
                <h1>Page Error</h1>
                <p>Could not load the requested page.</p>
                <p><small>${error.message}</small></p>
                <a href="#/" class="btn btn-primary">Return Home</a>
            </div>
        `);
    }
};

// Set up event listeners for routing
window.addEventListener('hashchange', router);
window.addEventListener('load', router);

// Export router for manual navigation if needed
export default router;