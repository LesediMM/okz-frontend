/**
 * src/pages/UserDashboard.js
 * Authenticated User Overview - Updated for User ID System
 */

import App from '../app.js';

export default {
    /**
     * Render the Dashboard layout
     */
    render: () => {
        // 1. Get user from LocalStorage
        const user = App.state.user || JSON.parse(localStorage.getItem('user') || '{}');
        const userId = localStorage.getItem('okz_user_id');

        // REDIRECT: Use okz_user_id instead of accessToken
        if (!userId) {
            window.location.hash = '#/login';
            return '';
        }

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
                            <a href="#/booking" class="btn btn-primary">Book New Court</a>
                            <a href="#/my-bookings" class="btn btn-secondary">View All Bookings</a>
                        </div>
                    </div>

                    <div class="card profile-card">
                        <h3>Your Profile</h3>
                        <p><strong>Email:</strong> ${user.email}</p>
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
     * Logic to fetch recent bookings after the HTML is injected
     */
    afterRender: async () => {
        const summaryContainer = document.getElementById('recent-bookings-summary');
        const userId = localStorage.getItem('okz_user_id');

        if (!userId) return;

        try {
            // 2. Fetch from the correct endpoint with x-user-id header
            const response = await fetch('https://okz.onrender.com/api/v1/bookings', {
                method: 'GET',
                headers: {
                    'x-user-id': userId,
                    'Origin': 'https://okz-frontend.onrender.com',
                    'Content-Type': 'application/json'
                }
            });

            const res = await response.json();

            // Your backend returns { status: 'success', data: { bookings: [...] } }
            if (response.ok && res.status === 'success' && res.data.bookings.length > 0) {
                // Show only the 3 most recent bookings
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
                summaryContainer.innerHTML = `
                    <p>No recent bookings. Ready to play?</p>
                    <a href="#/booking" class="text-link">Reserve your first court &rarr;</a>
                `;
            }
        } catch (error) {
            console.error('Dashboard Activity Error:', error);
            summaryContainer.innerHTML = `<p class="error-text">Unable to load activity.</p>`;
        }
    }
};