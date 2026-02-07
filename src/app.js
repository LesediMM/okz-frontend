/**
 * src/app.js
 * Core Application Logic & Global State - Updated for User ID System
 */

const App = {
    // Global State
    state: {
        user: null,
        isAuthenticated: false,
    },

    /**
     * Initialize the application state
     * Checks if the user has a valid ID session on load
     */
    async init() {
        console.log('OKZ Sports App Initializing (User ID System)...');
        
        // FIX: Look for okz_user_id instead of accessToken
        const userId = localStorage.getItem('okz_user_id');
        const savedUser = localStorage.getItem('user');
        
        // If we have a userId, the session is valid in this system
        if (userId && savedUser) {
            try {
                this.state.user = JSON.parse(savedUser);
                this.state.isAuthenticated = true;
                console.log('Session restored for User ID:', userId);
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
        const firstName = this.state.user?.fullName 
            ? this.state.user.fullName.split(' ')[0] 
            : 'Player';

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
     * Logic to attach event listeners to the layout
     */
    attachLayoutEvents() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    },

    /**
     * FIX: Updated to clear the specific User ID keys
     */
    handleLogout() {
        console.log('Clearing User ID session...');
        
        // Clear new system keys
        localStorage.removeItem('okz_user_id');
        localStorage.removeItem('user');
        
        // Clear legacy keys just in case
        localStorage.removeItem('accessToken');
        localStorage.removeItem('isAdmin'); 
        
        this.state.user = null;
        this.state.isAuthenticated = false;
        
        // Redirect to home and refresh to reset state
        window.location.hash = '#/';
        window.location.reload();
    }
};

export default App;