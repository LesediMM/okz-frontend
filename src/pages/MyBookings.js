/**
 * src/pages/MyBookings.js
 * User Booking History Page - Simplified (No external API imports)
 */

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
        const token = localStorage.getItem('accessToken');

        // 1. Check if user is logged in
        if (!token) {
            container.innerHTML = `
                <div class="auth-notice">
                    <p>Please <a href="#/login">login</a> to view your court reservations.</p>
                </div>`;
            return;
        }

        try {
            // 2. Fetch bookings directly from the backend
            const response = await fetch('https://okz.onrender.com/api/v1/bookings/my-bookings', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                const bookings = result.data.bookings;

                if (bookings.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <p>No bookings found. Ready to hit the court?</p>
                            <a href="#/booking" class="btn btn-primary">Book a Court Now</a>
                        </div>`;
                    return;
                }

                // 3. Render the booking cards
                container.innerHTML = bookings.map(b => `
                    <div class="booking-card">
                        <div class="booking-details">
                            <span class="court-badge">${b.courtNumber <= 2 ? 'PADDLE' : 'TENNIS'}</span>
                            <strong>Court ${b.courtNumber}</strong>
                            <p class="booking-time">
                                📅 ${new Date(b.date).toLocaleDateString()} <br>
                                ⏰ ${b.timeSlot} (${b.duration} Hour${b.duration > 1 ? 's' : ''})
                            </p>
                        </div>
                        <div class="booking-meta">
                            <span class="status-badge status-${b.status}">${b.status.toUpperCase()}</span>
                            <p class="booking-price">${b.price * b.duration} EGP</p>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = `<p class="error">Error: ${result.message || 'Failed to load bookings.'}</p>`;
            }
        } catch (err) {
            console.error('MyBookings Error:', err);
            container.innerHTML = `<p class="error">Unable to connect to server. Please try again later.</p>`;
        }
    }
};