/**
 * src/pages/UserDashboard.js
 * Authenticated User Overview - Zero Storage Frontend
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
        // Show login form to get email (no storage)
        return `
            <div class="dashboard-page">
                <header class="dashboard-header">
                    <h1>Welcome to OKZ Sports!</h1>
                    <p>Please enter your email to access your dashboard</p>
                </header>

                <div class="email-form">
                    <div class="form-group">
                        <label for="user-email">Your Email Address</label>
                        <input type="email" id="user-email" placeholder="Enter the email you registered with" required>
                    </div>
                    <button id="access-dashboard-btn" class="btn btn-primary">Access Dashboard</button>
                </div>

                <div class="dashboard-grid" style="display: none;">
                    <div class="card action-card">
                        <h3>Quick Actions</h3>
                        <div class="button-stack">
                            <button id="nav-booking-btn" class="btn btn-primary">Book New Court</button>
                            <button id="nav-my-bookings-btn" class="btn btn-secondary">View All Bookings</button>
                        </div>
                    </div>

                    <div class="card activity-card">
                        <h3>Recent Activity</h3>
                        <div id="recent-bookings-summary">
                            <p class="loading-text">Enter your email to see your bookings...</p>
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
        const app = document.getElementById('app');
        
        // Show email form first
        const emailForm = document.querySelector('.email-form');
        const dashboardGrid = document.querySelector('.dashboard-grid');
        const accessBtn = document.getElementById('access-dashboard-btn');
        const emailInput = document.getElementById('user-email');

        accessBtn.addEventListener('click', async () => {
            const userEmail = emailInput.value.trim();
            
            if (!userEmail) {
                alert('Please enter your email address');
                return;
            }

            // Hide email form, show dashboard
            emailForm.style.display = 'none';
            dashboardGrid.style.display = 'grid';

            // Now fetch data with the email
            fetchDashboardData(userEmail);
        });

        // --- MANUAL NAVIGATION HANDLERS ---
        document.getElementById('nav-booking-btn')?.addEventListener('click', () => {
            app.innerHTML = Booking.render();
            if (Booking.afterRender) Booking.afterRender();
        });

        document.getElementById('nav-my-bookings-btn')?.addEventListener('click', () => {
            app.innerHTML = MyBookings.render();
            if (MyBookings.afterRender) MyBookings.afterRender();
        });

        const fetchDashboardData = async (userEmail) => {
            const summaryContainer = document.getElementById('recent-bookings-summary');

            try {
                const response = await fetch('https://okz.onrender.com/api/v1/bookings', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-email': userEmail,
                        'X-User-Email': userEmail,
                        'Origin': 'https://okz-frontend.onrender.com'
                    }
                });

                const res = await response.json();

                if (response.ok && res.status === 'success' && res.data.bookings.length > 0) {
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
                        <button id="empty-state-booking-btn" class="btn-link">Reserve your first court →</button>
                    `;
                    
                    document.getElementById('empty-state-booking-btn')?.addEventListener('click', () => {
                        app.innerHTML = Booking.render();
                        if (Booking.afterRender) Booking.afterRender();
                    });
                }
            } catch (error) {
                console.error('Dashboard Activity Error:', error);
                summaryContainer.innerHTML = `<p class="error-text">Unable to load activity</p>`;
            }
        };
    }
};