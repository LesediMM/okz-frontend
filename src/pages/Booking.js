/**
 * src/pages/Booking.js
 * Self-Executing Version - No afterRender needed.
 */

export default {
    render: () => {
        // We trigger the logic 50ms after the string is returned to ensure the HTML is in the DOM
        setTimeout(() => {
            const dateInput = document.getElementById('booking-date');
            const typeInput = document.getElementById('court-type');
            const courtSelect = document.getElementById('court-number');
            const durationSelect = document.getElementById('duration');
            const timeContainer = document.getElementById('time-slots');
            const bookButton = document.getElementById('book-button');
            const bookingSummary = document.getElementById('booking-summary');
            
            let selectedTime = null;

            const updateBookingSummary = () => {
                if (dateInput.value && courtSelect.value && selectedTime) {
                    const duration = parseInt(durationSelect.value);
                    const price = duration * 400;
                    bookingSummary.innerHTML = `
                        <div class="summary-card">
                            <strong>Summary:</strong> ${dateInput.value} | ${selectedTime} | ${duration}hr | <strong>${price} EGP</strong>
                        </div>`;
                    bookButton.disabled = false;
                    bookButton.classList.add('active');
                }
            };

            const generateTimeSlots = () => {
                timeContainer.innerHTML = '';
                for (let hour = 8; hour <= 21; hour++) {
                    const time = `${hour.toString().padStart(2, '0')}:00`;
                    const btn = document.createElement('button');
                    btn.className = 'time-slot-btn';
                    btn.innerText = time;
                    btn.onclick = () => {
                        document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
                        btn.classList.add('selected');
                        selectedTime = time;
                        updateBookingSummary();
                    };
                    timeContainer.appendChild(btn);
                }
            };

            const updateCourts = () => {
                courtSelect.innerHTML = typeInput.value === 'paddle' 
                    ? '<option value="1">Paddle Court 1</option><option value="2">Paddle Court 2</option>'
                    : '<option value="3">Tennis Court 1</option><option value="4">Tennis Court 2</option><option value="5">Tennis Court 3</option>';
            };

            bookButton.onclick = async () => {
                const token = localStorage.getItem('accessToken');
                const data = {
                    courtNumber: parseInt(courtSelect.value),
                    date: dateInput.value,
                    timeSlot: selectedTime,
                    duration: parseInt(durationSelect.value),
                    price: parseInt(durationSelect.value) * 400
                };
                
                bookButton.innerText = "Booking...";
                try {
                    const res = await fetch('https://okz.onrender.com/api/v1/bookings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify(data)
                    });
                    if (res.ok) { alert("Booked!"); window.location.hash = '#/my-bookings'; }
                    else { alert("Failed. Try another slot."); bookButton.innerText = "BOOK NOW"; }
                } catch (e) { alert("Network Error"); }
            };

            // Init
            updateCourts();
            generateTimeSlots();
            dateInput.onchange = updateBookingSummary;
            typeInput.onchange = () => { updateCourts(); updateBookingSummary(); };
            durationSelect.onchange = updateBookingSummary;

        }, 50);

        return `
            <div class="booking-page">
                <h2>Reserve a Court</h2>
                <div class="booking-form">
                    <label>Date</label>
                    <input type="date" id="booking-date" value="${new Date().toISOString().split('T')[0]}">
                    
                    <label>Type</label>
                    <select id="court-type">
                        <option value="paddle">Paddle</option>
                        <option value="tennis">Tennis</option>
                    </select>

                    <label>Court</label>
                    <select id="court-number"></select>

                    <label>Duration</label>
                    <select id="duration">
                        <option value="1">1 Hour</option>
                        <option value="2">2 Hours</option>
                    </select>
                </div>

                <h3>Available Slots</h3>
                <div id="time-slots" class="slots-grid"></div>

                <div id="booking-summary"></div>
                <button id="book-button" class="book-btn-final" disabled>BOOK NOW</button>
            </div>

            <style>
                .slots-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0; }
                .time-slot-btn { padding: 10px; border: 1px solid #ccc; cursor: pointer; border-radius: 5px; }
                .time-slot-btn.selected { background: #27ae60; color: white; border-color: #27ae60; }
                .book-btn-final { width: 100%; padding: 15px; background: #ccc; border: none; color: white; font-weight: bold; cursor: not-allowed; }
                .book-btn-final.active { background: #27ae60; cursor: pointer; }
                .summary-card { background: #f4f4f4; padding: 15px; border-radius: 5px; margin-top: 10px; border-left: 4px solid #27ae60; }
            </style>
        `;
    }
};