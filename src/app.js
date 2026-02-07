/**
 * src/app.js
 * Core Application Logic & Global State - 100% Manual Routing
 */

const App = {
    state: {
        user: null,
        isAuthenticated: false,
    },

    async init() {
        console.log('OKZ Sports App Initializing (Manual Route Mode)...');
        
        const userId = localStorage.getItem('okz_user_id');
        const savedUser = localStorage.getItem('user');
        
        if (userId && savedUser) {
            try {
                this.state.user = JSON.parse(savedUser);
                this.state.isAuthenticated = true;
            } catch (e) {
                this.handleLogout();
            }
        }
    },

    /**
     * Updated Layout without Hashes
     */
    renderLayout(content) {
        const firstName = this.state.user?.fullName 
            ? this.state.user.fullName.split(' ')[0] 
            : 'Player';

        return `
            <nav class="navbar">
                <div class="nav-container">
                    <span class="nav-logo" data-route="home" style="cursor:pointer">OKZ SPORTS</span>
                    <div class="nav-links">
                        <button class="nav-link-btn" data-route="home">Home</button>
                        <button class="nav-link-btn" data-route="booking">Book Court</button>
                        ${this.state.isAuthenticated 
                            ? `<button class="nav-link-btn" data-route="my-bookings">My Bookings</button>
                               <button class="nav-link-btn" data-route="dashboard">Dashboard</button>
                               <button id="logout-btn" class="nav-btn-link">Logout (${firstName})</button>`
                            : `<button class="nav-link-btn" data-route="login">Login</button>`
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
     * Logic to handle the manual logout
     */
    async handleLogout() {
        console.log('Clearing User ID session...');
        localStorage.removeItem('okz_user_id');
        localStorage.removeItem('user');
        
        this.state.user = null;
        this.state.isAuthenticated = false;
        
        // Manual Redirect: Import Home dynamically and render
        const Home = (await import('./pages/Home.js')).default;
        const appContainer = document.getElementById('app');
        appContainer.innerHTML = Home.render();
        if (Home.afterRender) await Home.afterRender();
    }
};

export default App;