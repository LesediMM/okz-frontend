/**
 * src/app.js
 * Core Application Logic & Global State
 * Simplified Version (Direct API Calls)
 */

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
        const savedUser = localStorage.getItem('user');
        
        if (token) {
            try {
                // Verify token directly with your backend
                const response = await fetch('https://okz.onrender.com/api/v1/login/status', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                const result = await response.json();
                
                if (response.ok && result.status === 'success') {
                    this.state.user = result.data.user;
                    this.state.isAuthenticated = true;
                    console.log('User authenticated:', this.state.user.email);
                } else {
                    // Token invalid or expired
                    this.handleLogout();
                }
            } catch (error) {
                console.error('Auth initialization failed:', error);
                // If the server is down, we can still trust localStorage for UI state
                // or force logout if you want strict security:
                if (savedUser) {
                    this.state.user = JSON.parse(savedUser);
                    this.state.isAuthenticated = true;
                }
            }
        }
    },

    /**
     * Returns a global layout wrapper
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
                               <button id="logout-btn" class="nav-btn-link">Logout (${this.state.user?.fullName?.split(' ')[0]})</button>`
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
        localStorage.removeItem('user');
        this.state.user = null;
        this.state.isAuthenticated = false;
        window.location.hash = '#/login';
        window.location.reload(); // Refresh to clear state
    }
};

export default App;