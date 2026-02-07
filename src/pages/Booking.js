/**
 * src/pages/Booking.js
 * Integrated Booking Page - Production Version
 * Simplified: Direct API calls and handling backend availability matrix
 */

export default {
    render: () => `
        <div class="booking-container">
            <div class="booking-header">
                <h2>Reserve a Court</h2>
                <p>Select your preferences to see available times.</p>
            </div>
            
            <div class="booking-form-grid">
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
                        <option value="3">3 Hours (1200 EGP)</option>
                        <option value="4">4 Hours (1600 EGP)</option>
                    </select>
                </div>
            </div>

            <div id="availability-section" class="availability-section">
                <h3>5. Available Time Slots</h3>
                <p id="availability-hint">Please select a date to see availability.</p>
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
        const hint = document.getElementById('availability-hint');

        const updateCourts = () => {
            courtSelect.innerHTML = typeInput.value === 'paddle' 
                ? '<option value="1">Paddle Court 1</option><option value="2">Paddle Court 2</option>'
                : '<option value="3">Tennis Court 1</option><option value="4">Tennis Court 2</option><option value="5">Tennis Court 3</option>';
        };

        const fetchSlots = async () => {
            if (!dateInput.value) return;

            hint.innerText = "Checking availability...";
            slotContainer.innerHTML = '';

            try {
                // Fetch availability from backend
                const res = await fetch(`https://okz.onrender.com/api/v1/bookings/availability?date=${dateInput.value}&type=${typeInput.value}`);
                const result = await res.json();

                if (result.status === 'success') {
                    const selectedCourt = courtSelect.value;
                    const courtAvailability = result.data.availability[selectedCourt];
                    
                    slotContainer.innerHTML = '';
                    hint.innerText = `Showing slots for Court ${selectedCourt}`;

                    // The backend returns an object { "08:00": "available", "08:30": "booked" ... }
                    // We only want to show buttons for "available" slots
                    const slots = Object.keys(courtAvailability).filter(time => courtAvailability[time] === 'available');

                    if (slots.length === 0) {
                        hint.innerText = "No slots available for this court on the selected date.";
                    } else {
                        slots.forEach(time => {
                            const btn = document.createElement('button');
                            btn.className = 'slot-btn';
                            btn.innerText = time;
                            btn.onclick = () => makeBooking(time);
                            slotContainer.appendChild(btn);
                        });
                    }
                }
            } catch (err) {
                console.error('Fetch error:', err);
                hint.innerText = "Error loading availability. Check connection.";
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

            try {
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
                    alert("Booking Confirmed Successfully!");
                    window.location.hash = '#/my-bookings';
                } else {
                    alert("Booking Failed: " + result.message);
                }
            } catch (err) {
                alert("Server error. Please try again.");
            }
        };

        // Event Listeners
        dateInput.addEventListener('change', fetchSlots);
        typeInput.addEventListener('change', () => { updateCourts(); fetchSlots(); });
        courtSelect.addEventListener('change', fetchSlots);
        
        // Init
        updateCourts();
    }
};