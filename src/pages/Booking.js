/**
 * src/pages/Booking.js
 * Integrated Booking Page
 */

export default {
    render: () => `
        <div class="booking-container">
            <h2>Reserve a Court</h2>
            
            <div class="form-group">
                <label>1. Select Date</label>
                <input type="date" id="booking-date" min="${new Date().toISOString().split('T')[0]}">
            </div>

            <div class="form-group">
                <label>2. Court Type</label>
                <select id="court-type">
                    <option value="paddle">Paddle (Courts 1-2)</option>
                    <option value="tennis">Tennis (Courts 3-5)</option>
                </select>
            </div>

            <div class="form-group">
                <label>3. Select Specific Court</label>
                <select id="court-number">
                    </select>
            </div>

            <div class="form-group">
                <label>4. Duration</label>
                <select id="duration">
                    <option value="1">1 Hour (400 EGP)</option>
                    <option value="2">2 Hours (800 EGP)</option>
                </select>
            </div>

            <div id="availability-section" style="margin-top: 20px;">
                <label>5. Available Time Slots</label>
                <div id="availability-slots" class="availability-grid">
                    </div>
            </div>
        </div>
    `,

    afterRender: () => {
        const dateInput = document.getElementById('booking-date');
        const typeInput = document.getElementById('court-type');
        const courtSelect = document.getElementById('court-number');
        const slotContainer = document.getElementById('availability-slots');

        // Helper to update court numbers based on type
        const updateCourts = () => {
            courtSelect.innerHTML = typeInput.value === 'paddle' 
                ? '<option value="1">Paddle Court 1</option><option value="2">Paddle Court 2</option>'
                : '<option value="3">Tennis Court 1</option><option value="4">Tennis Court 2</option><option value="5">Tennis Court 3</option>';
        };

        const fetchSlots = async () => {
            if (!dateInput.value) return;

            slotContainer.innerHTML = '<p>Loading slots...</p>';

            try {
                // Fetch availability from backend
                const res = await fetch(`https://okz.onrender.com/api/v1/bookings/availability?date=${dateInput.value}&type=${typeInput.value}`);
                const result = await res.json();

                if (result.status === 'success') {
                    slotContainer.innerHTML = '';
                    // Backend returns an array of slots like ["08:00", "09:00", etc.]
                    result.data.availability.forEach(slot => {
                        const btn = document.createElement('button');
                        btn.className = 'slot-btn';
                        btn.innerText = slot;
                        btn.onclick = () => makeBooking(slot);
                        slotContainer.appendChild(btn);
                    });
                }
            } catch (err) {
                slotContainer.innerHTML = '<p>Error loading availability.</p>';
            }
        };

        const makeBooking = async (time) => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert("Please login to book a court!");
                window.location.hash = '#/login';
                return;
            }

            const bookingData = {
                courtNumber: parseInt(courtSelect.value),
                date: dateInput.value,
                timeSlot: time,
                duration: parseInt(document.getElementById('duration').value),
                price: 400
            };

            const response = await fetch('https://okz.onrender.com/api/v1/bookings', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(bookingData)
            });

            const result = await response.json();

            if (response.ok) {
                alert("Booking Confirmed!");
                window.location.hash = '#/my-bookings';
            } else {
                alert("Error: " + result.message);
            }
        };

        dateInput.addEventListener('change', fetchSlots);
        typeInput.addEventListener('change', () => { updateCourts(); fetchSlots(); });
        
        updateCourts(); // Initialize court numbers
    }
};