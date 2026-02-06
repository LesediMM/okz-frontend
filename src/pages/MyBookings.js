import { bookingApi } from '../api/booking.js';

export default {
    render: () => `<h2>My Bookings</h2><div id="booking-list">Loading...</div>`,
    afterRender: async () => {
        const res = await bookingApi.getUserBookings();
        const container = document.getElementById('booking-list');
        if (res.data.bookings.length === 0) {
            container.innerHTML = `<p>No bookings found.</p>`;
            return;
        }
        container.innerHTML = res.data.bookings.map(b => `
            <div class="booking-card">
                <div>
                    <strong>${b.courtType.toUpperCase()} - Court ${b.courtNumber}</strong>
                    <p>${b.date} @ ${b.timeSlot}</p>
                </div>
                <span class="status-badge status-${b.status}">${b.status}</span>
            </div>
        `).join('');
    }
};