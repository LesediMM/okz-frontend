/**
 * OKZ Sports - Navigation Bar Component
 * Developed by S.R.C Laboratories
 * Main navigation bar for the application
 */

export default function Navbar(props) {
    const {
        user,
        admin,
        currentPath,
        onNavigate,
        onLogout,
        onMenuToggle
    } = props;
    
    const container = document.createElement('nav');
    container.className = 'navbar';
    
    // Render function
    const render = () => {
        const isAdmin = !!admin;
        const isAuthenticated = !!user || isAdmin;
        
        container.innerHTML = `
            <div class="navbar-container">
                <!-- Logo/Brand -->
                <div class="navbar-brand">
                    <a href="/" class="logo-link" id="home-link">
                        <div class="logo-icon">
                            <i class="fas fa-tennis-ball"></i>
                            <i class="fas fa-table-tennis-paddle-ball"></i>
                        </div>
                        <span class="logo-text">OKZ Sports</span>
                    </a>
                </div>
                
                <!-- Mobile Menu Toggle -->
                <button class="navbar-toggle" id="mobile-menu-toggle">
                    <i class="fas fa-bars"></i>
                </button>
                
                <!-- Navigation Menu -->
                <div class="navbar-menu" id="navbar-menu">
                    <!-- Left Menu Items -->
                    <div class="navbar-left">
                        ${!isAdmin ? `
                            <a href="/" class="nav-link ${currentPath === '/' ? 'active' : ''}" id="nav-home">
                                <i class="fas fa-home"></i> Home
                            </a>
                            ${isAuthenticated ? `
                                <a href="/booking" class="nav-link ${currentPath === '/booking' ? 'active' : ''}" id="nav-booking">
                                    <i class="fas fa-calendar-plus"></i> Book Court
                                </a>
                                <a href="/my-bookings" class="nav-link ${currentPath === '/my-bookings' ? 'active' : ''}" id="nav-my-bookings">
                                    <i class="fas fa-calendar-check"></i> My Bookings
                                </a>
                            ` : ''}
                        ` : ''}
                        
                        ${isAdmin ? `
                            <a href="/admin/dashboard" class="nav-link ${currentPath === '/admin/dashboard' ? 'active' : ''}" id="nav-admin-dashboard">
                                <i class="fas fa-tachometer-alt"></i> Dashboard
                            </a>
                            <a href="/admin/bookings" class="nav-link ${currentPath === '/admin/bookings' ? 'active' : ''}" id="nav-admin-bookings">
                                <i class="fas fa-clipboard-list"></i> Manage Bookings
                            </a>
                        ` : ''}
                    </div>
                    
                    <!-- Right Menu Items -->
                    <div class="navbar-right">
                        ${!isAuthenticated ? `
                            <a href="/login" class="nav-link ${currentPath === '/login' ? 'active' : ''}" id="nav-login">
                                <i class="fas fa-sign-in-alt"></i> Login
                            </a>
                            <a href="/register" class="btn btn-primary btn-sm" id="nav-register">
                                <i class="fas fa-user-plus"></i> Sign Up
                            </a>
                            ${!isAdmin ? `
                                <a href="/admin/login" class="nav-link ${currentPath === '/admin/login' ? 'active' : ''}" id="nav-admin-login">
                                    <i class="fas fa-lock"></i> Admin
                                </a>
                            ` : ''}
                        ` : `
                            <div class="user-dropdown" id="user-dropdown">
                                <button class="user-menu-toggle" id="user-menu-toggle">
                                    <div class="user-avatar">
                                        <i class="fas fa-user${isAdmin ? '-shield' : ''}"></i>
                                    </div>
                                    <div class="user-info">
                                        <span class="user-name">${isAdmin ? admin.username : (user.fullName || user.email)}</span>
                                        <span class="user-role">${isAdmin ? 'Administrator' : 'Member'}</span>
                                    </div>
                                    <i class="fas fa-chevron-down"></i>
                                </button>
                                
                                <div class="dropdown-menu" id="dropdown-menu">
                                    ${!isAdmin ? `
                                        <a href="/dashboard" class="dropdown-item" id="dropdown-dashboard">
                                            <i class="fas fa-tachometer-alt"></i> Dashboard
                                        </a>
                                        <a href="/my-bookings" class="dropdown-item" id="dropdown-my-bookings">
                                            <i class="fas fa-calendar-check"></i> My Bookings
                                        </a>
                                        <div class="dropdown-divider"></div>
                                        <a href="/booking" class="dropdown-item" id="dropdown-booking">
                                            <i class="fas fa-plus"></i> Book Court
                                        </a>
                                        <div class="dropdown-divider"></div>
                                    ` : ''}
                                    
                                    ${isAdmin ? `
                                        <a href="/admin/dashboard" class="dropdown-item" id="dropdown-admin-dashboard">
                                            <i class="fas fa-tachometer-alt"></i> Admin Dashboard
                                        </a>
                                        <a href="/admin/bookings" class="dropdown-item" id="dropdown-admin-bookings">
                                            <i class="fas fa-clipboard-list"></i> Manage Bookings
                                        </a>
                                        <div class="dropdown-divider"></div>
                                    ` : ''}
                                    
                                    <button class="dropdown-item" id="dropdown-logout">
                                        <i class="fas fa-sign-out-alt"></i> Logout
                                    </button>
                                </div>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
        
        return container;
    };
    
    // Initialize component
    const init = () => {
        setupEventListeners();
    };
    
    // Update component with new props
    const update = (newProps) => {
        const newUser = newProps.user;
        const newAdmin = newProps.admin;
        const newCurrentPath = newProps.currentPath;
        
        if (newUser !== user || newAdmin !== admin || newCurrentPath !== currentPath) {
            render();
            init();
        }
    };
    
    // Setup event listeners
    const setupEventListeners = () => {
        // Home link
        const homeLink = container.querySelector('#home-link');
        if (homeLink) {
            homeLink.addEventListener('click', (e) => {
                e.preventDefault();
                onNavigate('/');
            });
        }
        
        // Navigation links
        const navLinks = container.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href) {
                    onNavigate(href);
                }
            });
        });
        
        // Register button
        const registerBtn = container.querySelector('#nav-register');
        if (registerBtn) {
            registerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                onNavigate('/register');
            });
        }
        
        // Mobile menu toggle
        const mobileMenuToggle = container.querySelector('#mobile-menu-toggle');
        const navbarMenu = container.querySelector('#navbar-menu');
        
        if (mobileMenuToggle && navbarMenu) {
            mobileMenuToggle.addEventListener('click', () => {
                navbarMenu.classList.toggle('active');
                mobileMenuToggle.innerHTML = navbarMenu.classList.contains('active') 
                    ? '<i class="fas fa-times"></i>'
                    : '<i class="fas fa-bars"></i>';
                
                if (onMenuToggle) {
                    onMenuToggle();
                }
            });
        }
        
        // User dropdown
        const userMenuToggle = container.querySelector('#user-menu-toggle');
        const dropdownMenu = container.querySelector('#dropdown-menu');
        
        if (userMenuToggle && dropdownMenu) {
            userMenuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!container.contains(e.target)) {
                    dropdownMenu.classList.remove('show');
                }
            });
        }
        
        // Dropdown items
        const dropdownItems = container.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (item.id === 'dropdown-logout') {
                    if (onLogout) {
                        onLogout();
                    }
                } else {
                    const href = item.getAttribute('href');
                    if (href) {
                        onNavigate(href);
                    }
                }
                
                // Close dropdown
                if (dropdownMenu) {
                    dropdownMenu.classList.remove('show');
                }
            });
        });
        
        // Close mobile menu when clicking a link
        const allLinks = container.querySelectorAll('a, button');
        allLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navbarMenu && navbarMenu.classList.contains('active')) {
                    navbarMenu.classList.remove('active');
                    if (mobileMenuToggle) {
                        mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                    }
                }
            });
        });
    };
    
    return {
        render,
        init,
        update
    };
}