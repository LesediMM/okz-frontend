/**
 * src/pages/MyBookings.js
 * User Booking History Page - Zero Storage Frontend
 */

import UserLogin from './UserLogin.js';
import Booking from './Booking.js';

export default {
    render: () => `
        <div class="my-bookings-container">
            <div class="booking-header">
                <h2>My Bookings</h2>
                <p>Enter your email to view your reservations</p>
            </div>
            
            <div class="email-form">
                <div class="form-group">
                    <label for="mybookings-email">Your Email Address</label>
                    <input type="email" id="mybookings-email" placeholder="Enter your registered email" required>
                </div>
                <button id="load-bookings-btn" class="btn btn-primary">View My Bookings</button>
            </div>
            
            <div id="booking-list" class="booking-list">
                <p class="loading">Enter your email above to fetch bookings...</p>
            </div>
        </div>
    `,

    afterRender: async () => {
        const container = document.getElementById('booking-list');
        const appContainer = document.getElementById('app');
        const loadBtn = document.getElementById('load-bookings-btn');
        const emailInput = document.getElementById('mybookings-email');

        loadBtn.addEventListener('click', async () => {
            const userEmail = emailInput.value.trim();
            
            if (!userEmail) {
                alert('Please enter your email address');
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userEmail)) {
                alert('Please enter a valid email address');
                return;
            }

            container.innerHTML = '<p class="loading">Fetching your bookings...</p>';

            try {
                // FIXED: Email is now passed as a query parameter instead of headers
                const response = await fetch(
                    `https://okz.onrender.com/api/v1/bookings?email=${encodeURIComponent(userEmail)}`,
                    {
                        method: 'GET',
                        headers: {
                            'Origin': 'https://okz-frontend.onrender.com',
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const result = await response.json();

                if (response.ok && result.status === 'success') {
                    const bookings = result.data.bookings;

                    if (!bookings || bookings.length === 0) {
                        container.innerHTML = `
                            <div class="empty-state">
                                <p>No bookings found for ${userEmail}. Ready to hit the court?</p>
                                <button id="mybookings-to-book" class="btn btn-primary">Book a Court Now</button>
                            </div>`;
                        
                        document.getElementById('mybookings-to-book')?.addEventListener('click', () => {
                            appContainer.innerHTML = Booking.render();
                            if (Booking.afterRender) Booking.afterRender();
                        });
                        return;
                    }

                    // Render the booking cards
                    container.innerHTML = bookings.map(b => {
                        let formattedDate;
                        try {
                            const dateObj = new Date(b.date);
                            formattedDate = dateObj.toLocaleDateString('en-GB', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            });
                        } catch (e) {
                            formattedDate = b.date || 'Date not available';
                        }
                        
                        return `
                        <div class="booking-card ${b.status === 'cancelled' ? 'cancelled' : ''}">
                            <div class="booking-details">
                                <span class="court-badge ${b.courtType}">${b.courtType.toUpperCase()}</span>
                                <strong>Court ${b.courtNumber}</strong>
                                <p class="booking-time">
                                    📅 ${formattedDate}<br>
                                    ⏰ ${b.timeSlot} (${b.duration} Hour${b.duration > 1 ? 's' : ''})
                                </p>
                            </div>
                            <div class="booking-meta">
                                <span class="status-badge status-${b.status}">${b.status.toUpperCase()}</span>
                                <p class="booking-price">${b.totalPrice} EGP</p>
                                ${b.paymentStatus === 'pending' ? '<span class="payment-warning">⚠️ Payment Pending</span>' : ''}
                            </div>
                        </div>
                        `;
                    }).join('');
                    
                } else {
                    container.innerHTML = `<p class="error">Error: ${result.message || 'Failed to load bookings.'}</p>`;
                }
            } catch (err) {
                console.error('MyBookings Error:', err);
                container.innerHTML = `<p class="error">Unable to connect to server. Please try again.</p>`;
            }
        });
    }
};