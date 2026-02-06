/**
 * src/app.js
 * Core Application Logic & Global State
 */

import { authApi } from './api/auth.js';

const App = {
    // Global State
    state: {
        user: null,
        isAuthenticated: false,
    },

    /**
     * Initialize the application state
     * Checks if the user has a valid session on load
     */
    async init() {
        console.log('OKZ Sports App Initializing...');
        
        const token = localStorage.getItem('accessToken');
        
        if (token) {
            try {
                // Verify token with backend: GET https://okz.onrender.com/api/v1/login/status
                const response = await authApi.status();
                
                if (response.status === 'success') {
                    this.state.user = response.data.user;
                    this.state.isAuthenticated = true;
                    console.log('User authenticated:', this.state.user.email);
                } else {
                    // Token invalid or expired
                    this.handleLogout();
                }
            } catch (error) {
                console.error('Auth initialization failed:', error);
                this.handleLogout();
            }
        }
    },

    /**
     * Returns a global layout wrapper
     * This ensures the Navbar is consistent across pages
     */
    renderLayout(content) {
        return `
            <nav class="navbar">
                <div class="nav-container">
                    <a href="#/" class="nav-logo">OKZ SPORTS</a>
                    <div class="nav-links">
                        <a href="#/">Home</a>
                        <a href="#/booking">Book Court</a>
                        ${this.state.isAuthenticated 
                            ? `<a href="#/my-bookings">My Bookings</a>
                               <a href="#/logout" id="logout-btn">Logout</a>`
                            : `<a href="#/login">Login</a>`
                        }
                    </div>
                </div>
            </nav>
            <main class="content-area">
                ${content}
            </main>
            <footer class="footer">
                <p>&copy; ${new Date().getFullYear()} OKZ Sports - 400 EGP/Hour</p>
            </footer>
        `;
    },

    handleLogout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        this.state.user = null;
        this.state.isAuthenticated = false;
        window.location.hash = '#/login';
    }
};

export default App;