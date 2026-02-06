/**
 * OKZ Sports - Client-Side Router
 * Developed by S.R.C Laboratories
 * Handles navigation and routing for the OKZ Sports application
 */

import Home from './pages/Home.js';
import UserLogin from './pages/UserLogin.js';
import UserRegister from './pages/UserRegister.js';
import UserDashboard from './pages/UserDashboard.js';
import Booking from './pages/Booking.js';
import MyBookings from './pages/MyBookings.js';
import AdminLogin from './pages/AdminLogin.js';
import AdminDashboard from './pages/AdminDashboard.js';
import AdminBookings from './pages/AdminBookings.js';

// Route definitions
const routes = [
    {
        path: '/',
        component: Home,
        title: 'Home',
        description: 'Book paddle and tennis courts online. 2 paddle courts and 3 tennis courts available at 400 EGP/hour.',
        public: true,
        icon: 'fas fa-home'
    },
    {
        path: '/login',
        component: UserLogin,
        title: 'User Login',
        description: 'Login to your OKZ Sports account to book courts.',
        public: true,
        icon: 'fas fa-sign-in-alt'
    },
    {
        path: '/register',
        component: UserRegister,
        title: 'User Registration',
        description: 'Create a new OKZ Sports account to start booking courts.',
        public: true,
        icon: 'fas fa-user-plus'
    },
    {
        path: '/dashboard',
        component: UserDashboard,
        title: 'User Dashboard',
        description: 'Your OKZ Sports dashboard with booking history and account details.',
        auth: true,
        icon: 'fas fa-tachometer-alt'
    },
    {
        path: '/booking',
        component: Booking,
        title: 'Book a Court',
        description: 'Book a paddle or tennis court at OKZ Sports. Choose from available time slots.',
        auth: true,
        icon: 'fas fa-calendar-check'
    },
    {
        path: '/my-bookings',
        component: MyBookings,
        title: 'My Bookings',
        description: 'View and manage your court bookings at OKZ Sports.',
        auth: true,
        icon: 'fas fa-list'
    },
    {
        path: '/admin/login',
        component: AdminLogin,
        title: 'Admin Login',
        description: 'Administrator login for OKZ Sports court management.',
        adminPublic: true,
        icon: 'fas fa-lock'
    },
    {
        path: '/admin/dashboard',
        component: AdminDashboard,
        title: 'Admin Dashboard',
        description: 'OKZ Sports administrator dashboard for court management.',
        admin: true,
        icon: 'fas fa-chart-line'
    },
    {
        path: '/admin/bookings',
        component: AdminBookings,
        title: 'Booking Management',
        description: 'Manage all court bookings at OKZ Sports.',
        admin: true,
        icon: 'fas fa-clipboard-list'
    }
];

// Route parameter patterns
const PARAM_PATTERN = /:(\w+)/g;

export function createRouter(store) {
    console.log('🔄 Creating router...');
    
    let currentPath = normalizePath(window.location.pathname);
    let currentRoute = null;
    let routeChangeListeners = [];
    let navigationHistory = [];
    const MAX_HISTORY = 50;
    
    // Initialize router
    function init() {
        // Setup popstate listener for browser back/forward
        window.addEventListener('popstate', handlePopState);
        
        // Setup click interception for internal links
        document.addEventListener('click', handleLinkClick);
        
        // Find initial route
        currentRoute = findRoute(currentPath);
        
        console.log('✅ Router initialized');
        console.log('📍 Initial route:', currentPath);
        
        return router;
    }
    
    // Normalize path (remove trailing slashes, ensure leading slash)
    function normalizePath(path) {
        if (!path) return '/';
        
        // Ensure path starts with slash
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        
        // Remove trailing slashes (except for root)
        if (path !== '/' && path.endsWith('/')) {
            path = path.slice(0, -1);
        }
        
        return path;
    }
    
    // Find matching route for a path
    function findRoute(path) {
        const normalizedPath = normalizePath(path);
        
        // First, try exact match
        let route = routes.find(r => r.path === normalizedPath);
        
        // If no exact match, check for parameterized routes
        if (!route) {
            route = routes.find(r => {
                // Convert route path to regex pattern
                const pattern = r.path.replace(PARAM_PATTERN, '([^/]+)');
                const regex = new RegExp(`^${pattern}$`);
                return regex.test(normalizedPath);
            });
            
            if (route) {
                // Extract parameters
                const paramNames = [...r.path.matchAll(PARAM_PATTERN)].map(m => m[1]);
                const pattern = route.path.replace(PARAM_PATTERN, '([^/]+)');
                const regex = new RegExp(`^${pattern}$`);
                const matches = normalizedPath.match(regex);
                
                if (matches) {
                    route.params = {};
                    paramNames.forEach((name, index) => {
                        route.params[name] = matches[index + 1];
                    });
                }
            }
        }
        
        // Default to home if no route found
        return route || routes.find(r => r.path === '/');
    }
    
    // Navigate to a new path
    function navigate(path, options = {}) {
        const normalizedPath = normalizePath(path);
        
        // Don't navigate if already on the same path
        if (normalizedPath === currentPath && !options.force) {
            return;
        }
        
        const previousPath = currentPath;
        const previousRoute = currentRoute;
        
        // Update current path and route
        currentPath = normalizedPath;
        currentRoute = findRoute(normalizedPath);
        
        // Update browser history if not a replace navigation
        if (!options.replace) {
            if (options.state) {
                window.history.pushState(options.state, '', normalizedPath);
            } else {
                window.history.pushState({}, '', normalizedPath);
            }
            
            // Add to navigation history
            navigationHistory.push({
                path: normalizedPath,
                timestamp: new Date().toISOString(),
                from: previousPath
            });
            
            // Keep history within limit
            if (navigationHistory.length > MAX_HISTORY) {
                navigationHistory.shift();
            }
        } else {
            window.history.replaceState({}, '', normalizedPath);
        }
        
        console.log('🚀 Navigation:', {
            from: previousPath,
            to: normalizedPath,
            route: currentRoute.path,
            options
        });
        
        // Notify listeners
        notifyRouteChange({
            from: previousPath,
            to: normalizedPath,
            fromRoute: previousRoute,
            toRoute: currentRoute
        });
        
        return currentRoute;
    }
    
    // Get current route
    function getCurrentRoute() {
        return currentRoute;
    }
    
    // Get current path
    function getCurrentPath() {
        return currentPath;
    }
    
    // Check if a route exists
    function hasRoute(path) {
        return !!findRoute(path);
    }
    
    // Get all available routes (for navigation menu)
    function getRoutes() {
        return routes.map(route => ({
            path: route.path,
            title: route.title,
            icon: route.icon,
            requiresAuth: !!route.auth,
            requiresAdmin: !!route.admin,
            isPublic: !!route.public || !!route.adminPublic
        }));
    }
    
    // Get routes accessible to current user
    function getAccessibleRoutes() {
        const user = store.auth.getUser();
        const admin = store.auth.getAdmin();
        
        return routes.filter(route => {
            // Public routes are always accessible
            if (route.public || route.adminPublic) return true;
            
            // Auth routes require user authentication
            if (route.auth && user) return true;
            
            // Admin routes require admin authentication
            if (route.admin && admin) return true;
            
            return false;
        }).map(route => ({
            path: route.path,
            title: route.title,
            icon: route.icon
        }));
    }
    
    // Go back in history
    function goBack() {
        if (navigationHistory.length > 1) {
            window.history.back();
        } else {
            navigate('/');
        }
    }
    
    // Go forward in history
    function goForward() {
        window.history.forward();
    }
    
    // Get navigation history
    function getHistory() {
        return [...navigationHistory];
    }
    
    // Handle popstate (browser back/forward)
    function handlePopState(event) {
        const newPath = normalizePath(window.location.pathname);
        
        if (newPath !== currentPath) {
            const previousPath = currentPath;
            const previousRoute = currentRoute;
            
            currentPath = newPath;
            currentRoute = findRoute(newPath);
            
            console.log('↩️ Popstate:', { from: previousPath, to: newPath });
            
            notifyRouteChange({
                from: previousPath,
                to: newPath,
                fromRoute: previousRoute,
                toRoute: currentRoute,
                isPopState: true
            });
        }
    }
    
    // Handle link clicks for SPA navigation
    function handleLinkClick(event) {
        // Only handle left clicks
        if (event.button !== 0) return;
        
        // Only handle links with href starting with /
        const link = event.target.closest('a[href^="/"]');
        if (!link) return;
        
        // Don't handle links with target="_blank" or external links
        if (link.target === '_blank' || link.hostname !== window.location.hostname) {
            return;
        }
        
        // Don't handle links with download attribute
        if (link.hasAttribute('download')) return;
        
        // Don't handle links with data-no-spa attribute
        if (link.hasAttribute('data-no-spa')) return;
        
        // Prevent default behavior
        event.preventDefault();
        
        // Get href and navigate
        const href = link.getAttribute('href');
        navigate(href);
    }
    
    // Add route change listener
    function onRouteChange(callback) {
        if (typeof callback === 'function') {
            routeChangeListeners.push(callback);
        }
    }
    
    // Remove route change listener
    function offRouteChange(callback) {
        const index = routeChangeListeners.indexOf(callback);
        if (index > -1) {
            routeChangeListeners.splice(index, 1);
        }
    }
    
    // Notify all route change listeners
    function notifyRouteChange(changeInfo) {
        routeChangeListeners.forEach(callback => {
            try {
                callback(changeInfo);
            } catch (error) {
                console.error('Route change listener error:', error);
            }
        });
    }
    
    // Generate URL with parameters
    function generateUrl(path, params = {}) {
        let url = path;
        
        // Replace parameters in path
        Object.keys(params).forEach(key => {
            url = url.replace(`:${key}`, encodeURIComponent(params[key]));
        });
        
        return url;
    }
    
    // Get query parameters from current URL
    function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        
        for (const [key, value] of params) {
            result[key] = value;
        }
        
        return result;
    }
    
    // Update query parameters without reloading
    function updateQueryParams(newParams, options = {}) {
        const currentParams = getQueryParams();
        const mergedParams = { ...currentParams, ...newParams };
        
        // Remove undefined/null values
        Object.keys(mergedParams).forEach(key => {
            if (mergedParams[key] === undefined || mergedParams[key] === null) {
                delete mergedParams[key];
            }
        });
        
        const queryString = new URLSearchParams(mergedParams).toString();
        const newUrl = queryString ? `${currentPath}?${queryString}` : currentPath;
        
        navigate(newUrl, { replace: options.replace || false });
    }
    
    // Get current route parameters
    function getRouteParams() {
        return currentRoute?.params || {};
    }
    
    // Check if current route matches a path pattern
    function isActive(path, exact = false) {
        const normalizedPath = normalizePath(path);
        
        if (exact) {
            return currentPath === normalizedPath;
        }
        
        return currentPath.startsWith(normalizedPath);
    }
    
    // Redirect to a different path
    function redirect(path, options = {}) {
        console.log('↪️ Redirect:', { from: currentPath, to: path });
        return navigate(path, { ...options, replace: true });
    }
    
    // Prefetch route data (for performance optimization)
    async function prefetchRoute(path) {
        const route = findRoute(path);
        if (!route) return;
        
        // Here you could preload component or data
        // For now, just return the route info
        return route;
    }
    
    // Router API
    const router = {
        // Properties
        get currentPath() {
            return currentPath;
        },
        
        get currentRoute() {
            return currentRoute;
        },
        
        // Methods
        navigate,
        getCurrentRoute,
        getCurrentPath,
        hasRoute,
        getRoutes,
        getAccessibleRoutes,
        goBack,
        goForward,
        getHistory,
        onRouteChange,
        offRouteChange,
        generateUrl,
        getQueryParams,
        updateQueryParams,
        getRouteParams,
        isActive,
        redirect,
        prefetchRoute,
        
        // Initialization
        init
    };
    
    // Initialize router
    router.init();
    
    // Make router available globally for debugging
    if (process.env.NODE_ENV === 'development') {
        window.okzRouter = router;
        console.log('🔧 Debug: router available as window.okzRouter');
    }
    
    return router;
}

// Export routes for reference
export { routes };

// Export router factory
export default { createRouter };