/**
 * src/pages/Home.js
 * Entry Portal for OKZ Sports
 */

export default {
    /**
     * Render the selection portal
     */
    render: async () => {
        return `
            <div class="home-portal">
                <header class="portal-header">
                    <div class="logo-wrapper">
                        <h1>OKZ SPORTS</h1>
                        <span class="badge">EGYPT</span>
                    </div>
                    <p>Premier Paddle & Tennis Court Management</p>
                </header>

                <div class="portal-grid">
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
                            <a href="#/login" class="btn btn-primary">User Login</a>
                            <a href="#/register" class="btn btn-outline">Create Account</a>
                        </div>
                    </div>

                    <div class="portal-card admin-card">
                        <div class="portal-icon">🛡️</div>
                        <h2>Staff Portal</h2>
                        <p>Administrative access for court oversight, revenue tracking, and global schedules.</p>
                        <ul class="feature-list">
                            <li>Real-time Utilization Stats</li>
                            <li>Financial Dashboards</li>
                            <li>Master Booking Control</li>
                        </ul>
                        <div class="portal-actions">
                            <a href="#/admin/login" class="btn btn-dark">Admin Login</a>
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
     * Lifecycle method for any page-specific animations or initializations
     */
    afterRender: async () => {
        // You can add entrance animations here if using a library like GSAP
        console.log("Home Portal Loaded");
    }
};