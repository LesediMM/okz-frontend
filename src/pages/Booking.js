import { bookingApi } from '../api/booking.js';

export default {
    render: () => `
        <div class="booking-container">
            <h2>Reserve a Court</h2>
            <div class="form-group">
                <label>Select Date</label>
                <input type="date" id="booking-date" min="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
                <label>Court Type</label>
                <select id="court-type">
                    <option value="paddle">Paddle (Courts 1-2)</option>
                    <option value="tennis">Tennis (Courts 3-5)</option>
                </select>
            </div>
            <div id="availability-slots" class="availability-grid">
                <p>Select a date to view available slots...</p>
            </div>
        </div>
    `,
    afterRender: () => {
        const dateInput = document.getElementById('booking-date');
        const typeInput = document.getElementById('court-type');

        const updateSlots = async () => {
            if (!dateInput.value) return;
            const res = await bookingApi.getAvailability(dateInput.value, typeInput.value);
            // Logic to render .slot buttons from res.data.availability
        };

        dateInput.addEventListener('change', updateSlots);
        typeInput.addEventListener('change', updateSlots);
    }
};