/**
 * src/pages/UserDashboard.js
 * Authenticated User Overview
 */

import App from '../app.js';
import { bookingApi } from '../api/booking.js';

export default {
    /**
     * Render the Dashboard layout
     */
    render: async () => {
        // Redirect to login if not authenticated
        if (!App.state.isAuthenticated) {
            window.location.hash = '#/login';
            return '';
        }

        const user = App.state.user;

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
                            <a href="#/my-bookings" class="btn">View All Bookings</a>
                        </div>
                    </div>

                    <div class="card profile-card">
                        <h3>Your Profile</h3>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Phone:</strong> ${user.phoneNumber || 'Not provided'}</p>
                        <p><strong>Status:</strong> <span class="status-badge status-confirmed">Active</span></p>
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
                            <li><strong>Hours:</strong> 8:00 AM - 10:00 PM</li>
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
        if (!App.state.isAuthenticated) return;

        const summaryContainer = document.getElementById('recent-bookings-summary');
        
        try {
            // Call GET /api/v1/bookings with a limit of 3 for the summary
            const response = await bookingApi.getUserBookings();

            if (response.status === 'success' && response.data.bookings.length > 0) {
                const latest = response.data.bookings.slice(0, 3);
                summaryContainer.innerHTML = `
                    <ul class="mini-booking-list">
                        ${latest.map(b => `
                            <li>
                                <strong>${b.courtType.toUpperCase()} #${b.courtNumber}</strong>
                                <span>${b.date} at ${b.timeSlot}</span>
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