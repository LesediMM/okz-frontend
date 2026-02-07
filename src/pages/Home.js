/**
 * src/pages/Home.js
 * Entry Portal for OKZ Sports - Manual Routing Version
 * Updated with sessionStorage support
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
        // Check if user is already logged in using both storage systems
        const sessionUserId = sessionStorage.getItem('okz_user_id');
        const localUserId = localStorage.getItem('okz_user_id');
        const isLoggedIn = !!(sessionUserId || localUserId);
        
        console.log('🏠 Home page render - Login status check:');
        console.log('SessionStorage userId:', sessionUserId);
        console.log('LocalStorage userId:', localUserId);
        console.log('Is logged in?', isLoggedIn);

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
                                <p class="welcome-back-msg">✅ Logged in and ready to play!</p>
                                <p class="storage-info"><small>Using: ${sessionUserId ? 'Session Storage' : 'Local Storage'}</small></p>
                            ` : `
                                <button data-route="login" class="btn btn-primary">User Login</button>
                                <button data-route="register" class="btn btn-outline">Create Account</button>
                                <p class="guest-msg">Welcome! Please login or register to book courts.</p>
                            `}
                        </div>
                    </div>
                    
                    <!-- Debug panel (visible in development) -->
                    ${process.env.NODE_ENV === 'development' ? `
                    <div class="debug-panel">
                        <h3>Debug Info</h3>
                        <p><strong>Session Storage:</strong> ${sessionUserId || 'Empty'}</p>
                        <p><strong>Local Storage:</strong> ${localUserId || 'Empty'}</p>
                        <button id="clear-storage-btn" class="btn btn-small">Clear All Storage</button>
                        <button id="refresh-page-btn" class="btn btn-small">Refresh Page</button>
                    </div>
                    ` : ''}
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
        console.log('🔧 Home page afterRender started...');
        
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
        console.log(`🎯 Found ${buttons.length} navigation buttons`);
        
        buttons.forEach(btn => {
            btn.addEventListener('click', async () => {
                const route = btn.getAttribute('data-route');
                console.log(`🖱️ Button clicked: ${route}`);
                
                const targetPage = pageMap[route];
                
                if (targetPage) {
                    console.log(`🚀 Navigating to: ${route}`);
                    
                    // 1. Wipe and Render
                    appContainer.innerHTML = targetPage.render();
                    
                    // 2. Trigger Logic
                    if (targetPage.afterRender) {
                        try {
                            await targetPage.afterRender();
                            console.log(`✅ ${route} page loaded successfully`);
                        } catch (err) {
                            console.error(`❌ Error in ${route}.afterRender:`, err);
                            // Fallback to home on error
                            appContainer.innerHTML = this.render();
                            if (this.afterRender) await this.afterRender();
                        }
                    }
                } else {
                    console.error(`❌ No page found for route: ${route}`);
                }
            });
        });

        // Debug button handlers (development only)
        if (process.env.NODE_ENV === 'development') {
            const clearBtn = document.getElementById('clear-storage-btn');
            const refreshBtn = document.getElementById('refresh-page-btn');
            
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    console.log('🧹 Clearing all storage...');
                    sessionStorage.clear();
                    localStorage.clear();
                    alert('All storage cleared! Page will refresh.');
                    location.reload();
                });
            }
            
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => {
                    console.log('🔄 Refreshing page...');
                    location.reload();
                });
            }
        }

        // Check if there's a stored user but App.state isn't updated
        const sessionUserId = sessionStorage.getItem('okz_user_id');
        const localUserId = localStorage.getItem('okz_user_id');
        const userId = sessionUserId || localUserId;
        
        if (userId) {
            console.log('🔄 Syncing App.state with storage...');
            try {
                const AppModule = await import('../app.js');
                const App = AppModule.default;
                
                // Get user data from storage
                const sessionUser = sessionStorage.getItem('user');
                const localUser = localStorage.getItem('user');
                const userJson = sessionUser || localUser;
                
                if (userJson) {
                    try {
                        const user = JSON.parse(userJson);
                        App.state.user = user;
                        App.state.isAuthenticated = true;
                        console.log('✅ App.state synced with storage');
                    } catch (e) {
                        console.error('❌ Failed to parse user JSON:', e);
                    }
                }
            } catch (err) {
                console.log('⚠️ Could not sync App.state:', err);
            }
        }

        console.log("✅ Home Portal Loaded - Session Storage System Active");
        console.log("📊 Storage Status:");
        console.log("- SessionStorage userId:", sessionStorage.getItem('okz_user_id'));
        console.log("- LocalStorage userId:", localStorage.getItem('okz_user_id'));
        console.log("- App.state.isAuthenticated:", (async () => {
            try {
                const AppModule = await import('../app.js');
                return AppModule.default.state.isAuthenticated;
            } catch {
                return 'N/A';
            }
        })());
    }
};