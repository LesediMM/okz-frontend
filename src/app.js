/**
 * src/app.js
 * Core Application Logic & Global State
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
        
        // If we have a token and user data, restore the session
        if (token && savedUser) {
            try {
                this.state.user = JSON.parse(savedUser);
                this.state.isAuthenticated = true;
                console.log('Session restored for:', this.state.user.email);
            } catch (e) {
                console.error('Failed to parse saved user data');
                this.handleLogout();
            }
        }
    },

    /**
     * Returns a global layout wrapper
     */
    renderLayout(content) {
        // Safe check for the user's name to display in the logout button
        const firstName = this.state.user?.fullName 
            ? this.state.user.fullName.split(' ')[0] 
            : 'User';

        return `
            <nav class="navbar">
                <div class="nav-container">
                    <a href="#/" class="nav-logo">OKZ SPORTS</a>
                    <div class="nav-links">
                        <a href="#/">Home</a>
                        <a href="#/booking">Book Court</a>
                        ${this.state.isAuthenticated 
                            ? `<a href="#/my-bookings">My Bookings</a>
                               <a href="#/dashboard">Dashboard</a>
                               <button id="logout-btn" class="nav-btn-link">Logout (${firstName})</button>`
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

    /**
     * Logic to attach event listeners to the layout (like the logout button)
     */
    attachLayoutEvents() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    },

    handleLogout() {
        console.log('Logging out...');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        localStorage.removeItem('isAdmin'); // Clear admin flag if present
        this.state.user = null;
        this.state.isAuthenticated = false;
        
        // Redirect to login and refresh to clear any sensitive data in memory
        window.location.hash = '#/login';
        window.location.reload();
    }
};

export default App;