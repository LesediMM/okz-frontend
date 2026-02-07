/**
 * src/pages/Home.js
 * Entry Portal for OKZ Sports - Manual Routing Version
 */

import UserLogin from './UserLogin.js';
import UserRegister from './UserRegister.js';
import UserDashboard from './UserDashboard.js';
import Booking from './Booking.js';

export default {
    /**
     * Render the selection portal
     */
    render: () => {
        // Check if user is already logged in using our new system
        const isLoggedIn = !!localStorage.getItem('okz_user_id');

        return `
            <div class="home-portal">
                <header class="portal-header">
                    <div class="logo-wrapper">
                        <h1>OKZ SPORTS</h1>
                        <span class="badge">EGYPT</span>
                    </div>
                    <p>Premier Paddle & Tennis Court Management</p>
                </header>

                <div class="portal-grid single-column">
                    <div class="portal-card user-card">
                        <div class="portal-icon">🎾</div>
                        <h2>Player Portal</h2>
                        <p>Book professional courts, view your schedule, and manage your sport sessions.</p>
                        <ul class="feature-list">
                            <li>Instant Court Booking</li>
                            <li>400 EGP / Hour Flat Rate</li>
                            <li>Match History Tracking</li>
                        </ul>
                        <div class="portal-actions">
                            ${isLoggedIn ? `
                                <button data-route="dashboard" class="btn btn-primary">Go to Dashboard</button>
                                <p class="welcome-back-msg">Logged in and ready to play!</p>
                            ` : `
                                <button data-route="login" class="btn btn-primary">User Login</button>
                                <button data-route="register" class="btn btn-outline">Create Account</button>
                            `}
                        </div>
                    </div>
                </div>

                <footer class="portal-footer">
                    <div class="footer-info">
                        <span>⏰ 8:00 AM - 10:00 PM</span>
                        <span class="separator">|</span>
                        <span>📍 Main Sports Complex</span>
                    </div>
                    <p class="copyright">&copy; ${new Date().getFullYear()} S.R.C Laboratories. All Rights Reserved.</p>
                </footer>
            </div>
        `;
    },

    /**
     * Lifecycle method - Handles the manual clicks within the home page
     */
    afterRender: async () => {
        const appContainer = document.getElementById('app');
        
        // Define page mapping for internal navigation
        const pageMap = {
            'login': UserLogin,
            'register': UserRegister,
            'dashboard': UserDashboard,
            'booking': Booking
        };

        // Attach listeners to the buttons we just rendered
        const buttons = document.querySelectorAll('[data-route]');
        buttons.forEach(btn => {
            btn.addEventListener('click', async () => {
                const route = btn.getAttribute('data-route');
                const targetPage = pageMap[route];

                if (targetPage) {
                    // 1. Wipe and Render
                    appContainer.innerHTML = targetPage.render();
                    // 2. Trigger Logic
                    if (targetPage.afterRender) {
                        await targetPage.afterRender();
                    }
                }
            });
        });

        console.log("Home Portal Loaded - User ID System Active (Manual Routing)");
    }
};