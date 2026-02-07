/**
 * src/router.js
 * SIMPLIFIED ROUTER - Basic navigation
 */

// Import all page components from pages directory
import Home from './pages/Home.js';
import UserLogin from './pages/UserLogin.js';
import UserRegister from './pages/UserRegister.js';
import Booking from './pages/Booking.js';
import MyBookings from './pages/MyBookings.js';
import UserDashboard from './pages/UserDashboard.js';

// Simple route definitions
const routes = {
    '/': Home,
    '/login': UserLogin,
    '/register': UserRegister,
    '/booking': Booking,
    '/my-bookings': MyBookings,
    '/dashboard': UserDashboard
};

// Simple authentication check
function isLoggedIn() {
    return !!localStorage.getItem('okz_user_id');
}

// Main router function - SIMPLIFIED
export const router = async () => {
    const app = document.getElementById('app');
    
    if (!app) {
        console.error('App container not found!');
        return;
    }
    
    // 1. Get current path from hash
    let path = window.location.hash.slice(1).toLowerCase() || '/';
    if (!path.startsWith('/')) {
        path = '/' + path;
    }

    // 2. SIMPLE NAVIGATION GUARD
    // Redirect to login if trying to access booking pages without being logged in
    if (['/booking', '/my-bookings', '/dashboard'].includes(path) && !isLoggedIn()) {
        window.location.hash = '#/login';
        return;
    }

    // 3. Get the page component
    const page = routes[path] || Home;

    try {
        // Render the page directly (no layout wrapper)
        app.innerHTML = await page.render();

        // Run page-specific JavaScript
        if (page.afterRender) {
            await page.afterRender();
        }

        // Scroll to top
        window.scrollTo(0, 0);
        
    } catch (error) {
        console.error('Routing Error:', error);
        
        // Show simple error page
        app.innerHTML = `
            <div style="text-align:center; padding: 50px;">
                <h1>Page Error</h1>
                <p>Could not load the requested page.</p>
                <a href="#/" style="color:#27ae60;">Go Home</a>
            </div>
        `;
    }
};

// Set up event listeners
window.addEventListener('hashchange', router);
window.addEventListener('load', router);

// Start the router
router();