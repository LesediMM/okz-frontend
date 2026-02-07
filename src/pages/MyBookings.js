/**
 * src/pages/MyBookings.js
 * User Booking History Page - 100% Manual Routing Version
 */

import UserLogin from './UserLogin.js';
import Booking from './Booking.js';

export default {
    render: () => `
        <div class="my-bookings-container">
            <div class="booking-header">
                <h2>My Bookings</h2>
                <p>Track your upcoming and past reservations.</p>
            </div>
            <div id="booking-list" class="booking-list">
                <p class="loading">Fetching your bookings...</p>
            </div>
        </div>
    `,

    afterRender: async () => {
        const container = document.getElementById('booking-list');
        const appContainer = document.getElementById('app');
        
        // 1. Get User ID from localStorage
        const userId = localStorage.getItem('okz_user_id');

        if (!userId) {
            container.innerHTML = `
                <div class="auth-notice">
                    <p>Please <button id="mybookings-to-login" class="btn-link">login</button> to view your court reservations.</p>
                </div>`;
            
            document.getElementById('mybookings-to-login')?.addEventListener('click', () => {
                appContainer.innerHTML = UserLogin.render();
                if (UserLogin.afterRender) UserLogin.afterRender();
            });
            return;
        }

        try {
            // 2. Fetch using correct endpoint and x-user-id header
            const response = await fetch('https://okz.onrender.com/api/v1/bookings', {
                method: 'GET',
                headers: {
                    'x-user-id': userId,
                    'Origin': 'https://okz-frontend.onrender.com',
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                const bookings = result.data.bookings;

                if (!bookings || bookings.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <p>No bookings found. Ready to hit the court?</p>
                            <button id="mybookings-to-book" class="btn btn-primary">Book a Court Now</button>
                        </div>`;
                    
                    document.getElementById('mybookings-to-book')?.addEventListener('click', () => {
                        appContainer.innerHTML = Booking.render();
                        // Booking uses a setTimeout internally in its render, but we call afterRender for consistency
                        if (Booking.afterRender) Booking.afterRender();
                    });
                    return;
                }

                // 3. Render the booking cards
                container.innerHTML = bookings.map(b => `
                    <div class="booking-card">
                        <div class="booking-details">
                            <span class="court-badge">${b.courtType.toUpperCase()}</span>
                            <strong>Court ${b.courtNumber}</strong>
                            <p class="booking-time">
                                📅 ${b.date} <br>
                                ⏰ ${b.timeSlot} (${b.duration} Hour${b.duration > 1 ? 's' : ''})
                            </p>
                        </div>
                        <div class="booking-meta">
                            <span class="status-badge status-${b.status}">${b.status.toUpperCase()}</span>
                            <p class="booking-price">${b.totalPrice} EGP</p>
                            ${b.paymentStatus === 'pending' ? '<span class="payment-warning">Payment Pending</span>' : ''}
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = `<p class="error">Error: ${result.message || 'Failed to load bookings.'}</p>`;
            }
        } catch (err) {
            console.error('MyBookings Error:', err);
            container.innerHTML = `<p class="error">Unable to connect to server. Please ensure the backend is running.</p>`;
        }
    }
};