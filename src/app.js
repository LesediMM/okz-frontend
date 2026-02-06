/**
 * OKZ Sports - Application Core
 * Developed by S.R.C Laboratories
 * Main application factory and state management
 */

import { createRouter } from './router.js';
import { createStore } from './store/index.js';
import Layout from './components/Layout.js';
import { showNotification } from './utils/notification.js';
import { handleApiError } from './utils/errorHandler.js';

// Application factory
export function createApp() {
    console.log('🔄 Creating OKZ Sports application...');
    
    // Initialize store and router
    const store = createStore();
    const router = createRouter(store);
    
    // Application instance
    const app = {
        store,
        router,
        currentPage: null,
        layout: null,
        
        // Mount application to DOM
        mount(selector) {
            console.log('📌 Mounting application to:', selector);
            
            const container = document.querySelector(selector);
            if (!container) {
                throw new Error(`Container "${selector}" not found`);
            }
            
            this.container = container;
            
            // Handle route changes
            this.setupRouteListeners();
            
            // Handle authentication state changes
            this.setupAuthListeners();
            
            // Handle global events
            this.setupGlobalListeners();
            
            // Initial render
            this.navigateToCurrentRoute();
            
            console.log('✅ Application mounted successfully');
            return this;
        },
        
        // Setup route change listeners
        setupRouteListeners() {
            this.router.onRouteChange(() => {
                this.render();
            });
            
            // Handle browser back/forward
            window.addEventListener('popstate', () => {
                this.render();
            });
        },
        
        // Setup authentication listeners
        setupAuthListeners() {
            // Listen for auth state changes
            this.store.auth.onAuthChange((user) => {
                if (user) {
                    console.log('👤 Auth state changed: User logged in');
                } else {
                    console.log('👤 Auth state changed: User logged out');
                }
                this.render();
            });
            
            this.store.auth.onAdminAuthChange((admin) => {
                if (admin) {
                    console.log('👑 Admin auth state changed: Admin logged in');
                } else {
                    console.log('👑 Admin auth state changed: Admin logged out');
                }
                this.render();
            });
        },
        
        // Setup global event listeners
        setupGlobalListeners() {
            // Handle session expiration
            window.addEventListener('auth-expired', () => {
                showNotification({
                    type: 'warning',
                    title: 'Session Expired',
                    message: 'Your session has expired. Please login again.',
                    duration: 5000
                });
                
                // Clear auth and redirect
                this.store.auth.clearAuth();
                this.router.navigate('/login');
            });
            
            // Handle network status
            window.addEventListener('online', () => {
                showNotification({
                    type: 'success',
                    title: 'Back Online',
                    message: 'Your connection has been restored.',
                    duration: 3000
                });
            });
            
            window.addEventListener('offline', () => {
                showNotification({
                    type: 'warning',
                    title: 'You\'re Offline',
                    message: 'Some features may not work without internet.',
                    duration: 5000
                });
            });
            
            // Handle keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                // Ctrl/Cmd + K for search
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    this.focusSearch();
                }
                
                // Escape to close modals
                if (e.key === 'Escape') {
                    this.closeAllModals();
                }
            });
        },
        
        // Navigate to current route
        navigateToCurrentRoute() {
            const path = window.location.pathname || '/';
            this.router.navigate(path);
        },
        
        // Main render method
        async render() {
            console.log('🎨 Rendering application...');
            
            try {
                // Get current route information
                const route = this.router.getCurrentRoute();
                if (!route) {
                    this.showErrorPage('Route not found');
                    return;
                }
                
                // Check authentication requirements
                if (!this.checkRouteAccess(route)) {
                    return;
                }
                
                // Show loading state
                this.showLoading();
                
                // Get current user/admin state
                const user = this.store.auth.getUser();
                const admin = this.store.auth.getAdmin();
                
                // Create layout
                this.layout = new Layout({
                    user,
                    admin,
                    currentPath: this.router.currentPath,
                    onNavigate: (path) => this.router.navigate(path),
                    onLogout: () => this.handleLogout(),
                    onMenuToggle: () => this.toggleMobileMenu()
                });
                
                // Create page component
                const PageComponent = route.component;
                this.currentPage = new PageComponent({
                    store: this.store,
                    router: this.router,
                    user,
                    admin,
                    onNavigate: (path) => this.router.navigate(path),
                    onShowNotification: showNotification,
                    onHandleError: handleApiError
                });
                
                // Render layout with page
                this.container.innerHTML = '';
                const layoutElement = this.layout.render(this.currentPage.render());
                this.container.appendChild(layoutElement);
                
                // Initialize page component
                if (this.currentPage.init) {
                    await this.currentPage.init();
                }
                
                // Initialize layout
                if (this.layout.init) {
                    this.layout.init();
                }
                
                // Update page title
                this.updatePageTitle(route);
                
                // Scroll to top on route change
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                // Track page view for analytics
                this.trackPageView(route);
                
                console.log('✅ Render complete for:', route.path);
                
            } catch (error) {
                console.error('❌ Render error:', error);
                this.showErrorPage('Failed to render page');
                handleApiError(error);
            } finally {
                // Hide loading state
                this.hideLoading();
            }
        },
        
        // Check if user has access to the route
        checkRouteAccess(route) {
            const user = this.store.auth.getUser();
            const admin = this.store.auth.getAdmin();
            
            // Check if route requires authentication
            if (route.auth && !user) {
                showNotification({
                    type: 'warning',
                    title: 'Authentication Required',
                    message: 'Please login to access this page.',
                    duration: 3000
                });
                this.router.navigate('/login');
                return false;
            }
            
            // Check if route requires admin authentication
            if (route.admin && !admin) {
                showNotification({
                    type: 'warning',
                    title: 'Admin Access Required',
                    message: 'Please login as admin to access this page.',
                    duration: 3000
                });
                this.router.navigate('/admin/login');
                return false;
            }
            
            // Redirect authenticated users away from auth pages
            if ((route.path === '/login' || route.path === '/register') && user) {
                this.router.navigate('/dashboard');
                return false;
            }
            
            // Redirect admin away from admin login if already logged in
            if (route.path === '/admin/login' && admin) {
                this.router.navigate('/admin/dashboard');
                return false;
            }
            
            return true;
        },
        
        // Update page title based on route
        updatePageTitle(route) {
            const baseTitle = 'OKZ Sports';
            let pageTitle = baseTitle;
            
            if (route.title) {
                pageTitle = `${route.title} - ${baseTitle}`;
            } else {
                // Generate title from path
                const pathName = route.path === '/' ? 'Home' : 
                               route.path.replace(/\//g, ' ').trim().replace(/\b\w/g, l => l.toUpperCase());
                pageTitle = `${pathName} - ${baseTitle}`;
            }
            
            document.title = pageTitle;
            
            // Update meta description for SEO
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription && route.description) {
                metaDescription.content = route.description;
            }
        },
        
        // Show loading state
        showLoading() {
            const loadingEl = document.createElement('div');
            loadingEl.className = 'app-loading-overlay';
            loadingEl.innerHTML = `
                <div class="app-loading-content">
                    <div class="spinner"></div>
                    <p>Loading...</p>
                </div>
            `;
            
            // Add styles if not already present
            if (!document.querySelector('#app-loading-styles')) {
                const style = document.createElement('style');
                style.id = 'app-loading-styles';
                style.textContent = `
                    .app-loading-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(255, 255, 255, 0.9);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 9999;
                        backdrop-filter: blur(2px);
                    }
                    .app-loading-content {
                        text-align: center;
                    }
                    .app-loading-content .spinner {
                        width: 40px;
                        height: 40px;
                        border: 3px solid #e2e8f0;
                        border-top-color: #2563eb;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 15px;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(loadingEl);
            this.loadingOverlay = loadingEl;
        },
        
        // Hide loading state
        hideLoading() {
            if (this.loadingOverlay && this.loadingOverlay.parentNode) {
                this.loadingOverlay.style.opacity = '0';
                this.loadingOverlay.style.transition = 'opacity 0.3s ease';
                setTimeout(() => {
                    if (this.loadingOverlay.parentNode) {
                        this.loadingOverlay.remove();
                    }
                }, 300);
            }
        },
        
        // Show error page
        showErrorPage(message) {
            this.container.innerHTML = `
                <div class="error-page">
                    <div class="error-page-content">
                        <div class="error-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h1>Something went wrong</h1>
                        <p>${message || 'An unexpected error occurred'}</p>
                        <div class="error-actions">
                            <button onclick="window.location.reload()" class="btn btn-primary">
                                <i class="fas fa-redo"></i> Reload Page
                            </button>
                            <button onclick="app.router.navigate('/')" class="btn btn-outline">
                                <i class="fas fa-home"></i> Go Home
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // Add error page styles
            const style = document.createElement('style');
            style.textContent = `
                .error-page {
                    min-height: 70vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                }
                .error-page-content {
                    text-align: center;
                    max-width: 500px;
                }
                .error-icon {
                    font-size: 64px;
                    color: #f59e0b;
                    margin-bottom: 20px;
                }
                .error-page h1 {
                    font-size: 2rem;
                    margin-bottom: 15px;
                    color: #1e293b;
                }
                .error-page p {
                    color: #64748b;
                    margin-bottom: 30px;
                    line-height: 1.6;
                }
                .error-actions {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                }
                .btn {
                    padding: 10px 20px;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                    font-size: 14px;
                }
                .btn-primary {
                    background: #2563eb;
                    color: white;
                }
                .btn-primary:hover {
                    background: #1d4ed8;
                }
                .btn-outline {
                    background: transparent;
                    border: 2px solid #2563eb;
                    color: #2563eb;
                }
                .btn-outline:hover {
                    background: #2563eb;
                    color: white;
                }
            `;
            document.head.appendChild(style);
        },
        
        // Handle logout
        async handleLogout() {
            try {
                const isAdmin = this.store.auth.isAdminAuthenticated();
                
                await this.store.auth.logout();
                
                showNotification({
                    type: 'success',
                    title: 'Logged Out',
                    message: 'You have been successfully logged out.',
                    duration: 3000
                });
                
                // Redirect based on user type
                if (isAdmin) {
                    this.router.navigate('/admin/login');
                } else {
                    this.router.navigate('/');
                }
                
            } catch (error) {
                console.error('Logout error:', error);
                showNotification({
                    type: 'error',
                    title: 'Logout Failed',
                    message: 'There was an error logging out.',
                    duration: 3000
                });
            }
        },
        
        // Focus search (for keyboard shortcut)
        focusSearch() {
            const searchInput = document.querySelector('#search-input');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        },
        
        // Close all modals
        closeAllModals() {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        },
        
        // Toggle mobile menu
        toggleMobileMenu() {
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu) {
                navMenu.classList.toggle('active');
            }
        },
        
        // Track page view for analytics
        trackPageView(route) {
            // You can integrate with Google Analytics or other analytics here
            if (window.gtag) {
                window.gtag('event', 'page_view', {
                    page_title: route.title || route.path,
                    page_path: route.path
                });
            }
            
            // Log to console in development
            if (process.env.NODE_ENV === 'development') {
                console.log('📊 Page view:', route.path);
            }
        },
        
        // Get application state (for debugging)
        getState() {
            return {
                user: this.store.auth.getUser(),
                admin: this.store.auth.getAdmin(),
                currentPath: this.router.currentPath,
                isAuthenticated: this.store.auth.isAuthenticated(),
                isAdminAuthenticated: this.store.auth.isAdminAuthenticated()
            };
        },
        
        // Destroy application (cleanup)
        destroy() {
            console.log('🧹 Destroying application...');
            
            // Clean up event listeners
            window.removeEventListener('popstate', this.render);
            window.removeEventListener('online', this.handleOnline);
            window.removeEventListener('offline', this.handleOffline);
            
            // Clear intervals and timeouts
            if (this.intervals) {
                this.intervals.forEach(clearInterval);
            }
            
            if (this.timeouts) {
                this.timeouts.forEach(clearTimeout);
            }
            
            // Clear container
            if (this.container) {
                this.container.innerHTML = '';
            }
            
            console.log('✅ Application destroyed');
        }
    };
    
    // Make app globally available for debugging
    if (process.env.NODE_ENV === 'development') {
        window.okzApp = app;
        console.log('🔧 Debug: app available as window.okzApp');
    }
    
    return app;
}

// Export application factory
export default { createApp };