/**
 * src/pages/UserDashboard.js
 * Authenticated User Overview - 100% Manual Routing
 * Updated with sessionStorage and proper headers
 */

import App from '../app.js';
import UserLogin from './UserLogin.js';
import Booking from './Booking.js';
import MyBookings from './MyBookings.js';

export default {
    /**
     * Render the Dashboard layout
     */
    render: () => {
        // Check both sessionStorage and localStorage
        const sessionUserId = sessionStorage.getItem('okz_user_id');
        const sessionUser = sessionStorage.getItem('user');
        
        const localUserId = localStorage.getItem('okz_user_id');
        const localUser = localStorage.getItem('user');
        
        const userId = sessionUserId || localUserId;
        const user = sessionUser ? JSON.parse(sessionUser) : 
                    localUser ? JSON.parse(localUser) : 
                    (App.state.user || {});
        
        console.log('🔍 Dashboard render - Checking user session...');
        console.log('SessionStorage userId:', sessionUserId);
        console.log('LocalStorage userId:', localUserId);
        console.log('Selected userId:', userId);
        console.log('User object:', user);

        // MANUAL REDIRECT: If no session, immediately swap to Login
        if (!userId) {
            console.log('❌ No user ID found, redirecting to login...');
            setTimeout(() => {
                const app = document.getElementById('app');
                app.innerHTML = UserLogin.render();
                if (UserLogin.afterRender) UserLogin.afterRender();
            }, 0);
            return '<div class="loader">Redirecting to login...</div>';
        }

        console.log('✅ User authenticated, rendering dashboard...');
        return `
            <div class="dashboard-page">
                <header class="dashboard-header">
                    <h1>Welcome back, ${user.fullName || 'Champion'}!</h1>
                    <p>Manage your sessions and book your next match.</p>
                </header>

                <div class="dashboard-grid">
                    <div class="card action-card">
                        <h3>Quick Actions</h3>
                        <div class="button-stack">
                            <button id="nav-booking-btn" class="btn btn-primary">Book New Court</button>
                            <button id="nav-my-bookings-btn" class="btn btn-secondary">View All Bookings</button>
                        </div>
                    </div>

                    <div class="card profile-card">
                        <h3>Your Profile</h3>
                        <p><strong>Email:</strong> ${user.email || 'Not available'}</p>
                        <p><strong>Phone:</strong> ${user.phoneNumber || 'Not provided'}</p>
                        <p><strong>Status:</strong> <span class="status-badge status-active">Active Member</span></p>
                    </div>

                    <div class="card activity-card">
                        <h3>Recent Activity</h3>
                        <div id="recent-bookings-summary">
                            <p class="loading-text">Fetching your latest updates...</p>
                        </div>
                    </div>

                    <div class="card info-card">
                        <h3>Club Info</h3>
                        <ul>
                            <li><strong>Rate:</strong> 400 EGP / Hour</li>
                            <li><strong>Hours:</strong> 08:00 AM - 10:00 PM</li>
                            <li><strong>Location:</strong> Main Sports Hub</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Logic to handle navigation and data fetching
     */
    afterRender: async () => {
        console.log('🔧 Dashboard afterRender started...');
        
        const app = document.getElementById('app');
        
        // Get user ID from sessionStorage first, then localStorage
        const userId = sessionStorage.getItem('okz_user_id') || localStorage.getItem('okz_user_id');
        
        console.log('📋 Using userId for fetch:', userId);
        
        if (!userId) {
            console.error('❌ No user ID available for fetch');
            return;
        }

        // --- MANUAL NAVIGATION HANDLERS ---
        document.getElementById('nav-booking-btn').addEventListener('click', () => {
            console.log('📅 Navigating to Booking page...');
            app.innerHTML = Booking.render();
            if (Booking.afterRender) Booking.afterRender();
        });

        document.getElementById('nav-my-bookings-btn').addEventListener('click', () => {
            console.log('📋 Navigating to MyBookings page...');
            app.innerHTML = MyBookings.render();
            if (MyBookings.afterRender) MyBookings.afterRender();
        });

        // --- DATA FETCHING LOGIC ---
        const summaryContainer = document.getElementById('recent-bookings-summary');

        try {
            console.log('📤 Fetching bookings from API...');
            console.log('Request headers:', {
                'x-user-id': userId,
                'X-User-ID': userId,
                'Origin': 'https://okz-frontend.onrender.com',
                'Content-Type': 'application/json'
            });
            
            const response = await fetch('https://okz.onrender.com/api/v1/bookings', {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'x-user-id': userId,        // lowercase - backend expects this
                    'X-User-ID': userId,        // uppercase - for case-sensitive browsers
                    'Origin': 'https://okz-frontend.onrender.com',
                    'Content-Type': 'application/json'
                }
            });

            console.log('📥 API Response - Status:', response.status);
            console.log('📥 API Response - Headers:', [...response.headers.entries()]);
            
            // Check if response is OK before parsing JSON
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error Response:', errorText);
                throw new Error(`API returned ${response.status}: ${errorText}`);
            }
            
            const res = await response.json();
            console.log('📥 API Response - Data:', res);

            if (response.ok && res.status === 'success' && res.data.bookings.length > 0) {
                console.log(`✅ Found ${res.data.bookings.length} bookings`);
                const latest = res.data.bookings.slice(0, 3);
                summaryContainer.innerHTML = `
                    <ul class="mini-booking-list">
                        ${latest.map(b => `
                            <li>
                                <strong>${b.courtType.toUpperCase()} Court ${b.courtNumber}</strong>
                                <span>${new Date(b.date).toLocaleDateString()} at ${b.timeSlot}</span>
                                <span class="badge-${b.status}">${b.status}</span>
                            </li>
                        `).join('')}
                    </ul>
                `;
            } else {
                console.log('ℹ️ No bookings found or empty response');
                summaryContainer.innerHTML = `
                    <p>No recent bookings. Ready to play?</p>
                    <button id="empty-state-booking-btn" class="btn-link">Reserve your first court &rarr;</button>
                `;
                
                // Add listener for the empty state link
                document.getElementById('empty-state-booking-btn')?.addEventListener('click', () => {
                    console.log('📅 Navigating to Booking from empty state...');
                    app.innerHTML = Booking.render();
                    if (Booking.afterRender) Booking.afterRender();
                });
            }
        } catch (error) {
            console.error('❌ Dashboard Activity Error:', error);
            summaryContainer.innerHTML = `
                <div class="error-message">
                    <p class="error-text">Unable to load activity: ${error.message}</p>
                    <button id="retry-fetch-btn" class="btn btn-outline">Retry</button>
                </div>
            `;
            
            // Add retry button listener
            document.getElementById('retry-fetch-btn')?.addEventListener('click', () => {
                console.log('🔄 Retrying fetch...');
                // Re-run afterRender
                const currentAfterRender = this.afterRender;
                currentAfterRender.call(this);
            });
        }
    }
};