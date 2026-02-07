/**
 * src/pages/Booking.js
 * Self-Executing Version - No afterRender needed.
 */

export default {
    render: () => {
        // We trigger the logic 50ms after the string is returned to ensure the HTML is in the DOM
        setTimeout(() => {
            const dateInput = document.getElementById('booking-date');
            const typeSelect = document.getElementById('court-type');
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
                } else {
                    bookButton.disabled = true;
                    bookButton.classList.remove('active');
                }
            };

            const generateTimeSlots = () => {
                timeContainer.innerHTML = '';
                for (let hour = 8; hour <= 22; hour++) {
                    // Generate both :00 and :30 slots for each hour (except last hour)
                    if (hour < 22) {
                        const time00 = `${hour.toString().padStart(2, '0')}:00`;
                        const btn00 = createTimeSlotButton(time00);
                        timeContainer.appendChild(btn00);
                    }
                    
                    if (hour >= 8 && hour <= 21) {
                        const time30 = `${hour.toString().padStart(2, '0')}:30`;
                        const btn30 = createTimeSlotButton(time30);
                        timeContainer.appendChild(btn30);
                    }
                }
            };

            const createTimeSlotButton = (time) => {
                const btn = document.createElement('button');
                btn.className = 'time-slot-btn';
                btn.innerText = time;
                btn.onclick = () => {
                    document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    selectedTime = time;
                    updateBookingSummary();
                };
                return btn;
            };

            const updateCourts = () => {
                courtSelect.innerHTML = '';
                if (typeSelect.value === 'paddle') {
                    const paddleCourts = [
                        { value: 1, text: 'Paddle Court 1' },
                        { value: 2, text: 'Paddle Court 2' }
                    ];
                    paddleCourts.forEach(court => {
                        const option = document.createElement('option');
                        option.value = court.value;
                        option.textContent = court.text;
                        courtSelect.appendChild(option);
                    });
                } else {
                    const tennisCourts = [
                        { value: 3, text: 'Tennis Court 1' },
                        { value: 4, text: 'Tennis Court 2' },
                        { value: 5, text: 'Tennis Court 3' }
                    ];
                    tennisCourts.forEach(court => {
                        const option = document.createElement('option');
                        option.value = court.value;
                        option.textContent = court.text;
                        courtSelect.appendChild(option);
                    });
                }
                updateBookingSummary();
            };

            bookButton.onclick = async () => {
                // UPDATE: Retrieve okz_user_id instead of token
                const userId = localStorage.getItem('okz_user_id');
                if (!userId) {
                    alert("Session expired. Please login again.");
                    window.location.hash = '#/login';
                    return;
                }

                // Create booking data according to backend requirements
                const bookingData = {
                    courtType: typeSelect.value,        // MUST BE "paddle" or "tennis"
                    courtNumber: Number(courtSelect.value), // Must be 1-2 for paddle, 3-5 for tennis
                    date: dateInput.value,              // "YYYY-MM-DD"
                    timeSlot: selectedTime,             // "HH:00" or "HH:30"
                    duration: Number(durationSelect.value)  // Integer 1-4
                };

                // Validate data before sending
                if (!bookingData.courtType) {
                    alert("Please select a court type (paddle or tennis)");
                    return;
                }

                if (!bookingData.courtNumber) {
                    alert("Please select a court number");
                    return;
                }

                // Validate court number based on court type
                if (bookingData.courtType === 'paddle' && (bookingData.courtNumber < 1 || bookingData.courtNumber > 2)) {
                    alert("For paddle courts, court number must be 1 or 2");
                    return;
                }

                if (bookingData.courtType === 'tennis' && (bookingData.courtNumber < 3 || bookingData.courtNumber > 5)) {
                    alert("For tennis courts, court number must be 3, 4, or 5");
                    return;
                }

                if (!bookingData.date) {
                    alert("Please select a date");
                    return;
                }

                if (!bookingData.timeSlot) {
                    alert("Please select a time slot");
                    return;
                }

                // Validate date is not in the past
                const selectedDate = new Date(bookingData.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (selectedDate < today) {
                    alert("Date cannot be in the past");
                    return;
                }

                // Validate advance booking (not more than 30 days)
                const maxDate = new Date();
                maxDate.setDate(today.getDate() + 30);
                
                if (selectedDate > maxDate) {
                    alert("Cannot book more than 30 days in advance");
                    return;
                }

                // Validate time slot format
                const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
                if (!timeRegex.test(bookingData.timeSlot)) {
                    alert("Invalid time slot format. Use HH:MM (24-hour format)");
                    return;
                }

                // Validate minutes are :00 or :30
                const minutes = bookingData.timeSlot.split(':')[1];
                if (minutes !== '00' && minutes !== '30') {
                    alert("Time slot must end with :00 or :30");
                    return;
                }

                // Validate operating hours (08:00 to 22:00)
                const timeHour = parseInt(bookingData.timeSlot.split(':')[0]);
                if (timeHour < 8 || timeHour > 22) {
                    alert("Booking hours are from 08:00 to 22:00 only");
                    return;
                }

                // Check if time is exactly 22:00 (last slot)
                if (bookingData.timeSlot === '22:00' && minutes !== '00') {
                    alert("Last booking slot is 22:00");
                    return;
                }

                bookButton.innerText = "Processing...";
                bookButton.disabled = true;

                try {
                    const res = await fetch('https://okz.onrender.com/api/v1/bookings', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json', 
                            // UPDATE: Use the custom header and Origin required for production
                            'x-user-id': userId,
                            'Origin': 'https://okz-frontend.onrender.com'
                        },
                        body: JSON.stringify(bookingData)
                    });

                    const responseData = await res.json();
                    
                    if (res.ok) { 
                        alert("Court reserved successfully!"); 
                        window.location.hash = '#/my-bookings'; 
                    } else { 
                        // Show specific error message from backend if available
                        const errorMsg = responseData.message || "Failed to book. Please try another slot.";
                        alert(`Booking failed: ${errorMsg}`); 
                        bookButton.innerText = "BOOK NOW";
                        bookButton.disabled = false;
                        bookButton.classList.add('active');
                    }
                } catch (e) { 
                    alert("Network error. Check your connection."); 
                    bookButton.innerText = "BOOK NOW";
                    bookButton.disabled = false;
                    bookButton.classList.add('active');
                }
            };

            // Initialize form
            updateCourts();
            generateTimeSlots();
            
            // Event listeners
            dateInput.onchange = updateBookingSummary;
            typeSelect.onchange = updateCourts;
            courtSelect.onchange = updateBookingSummary;
            durationSelect.onchange = updateBookingSummary;

            // Set minimum date to today and maximum to 30 days from now
            const today = new Date().toISOString().split('T')[0];
            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + 30);
            const maxDateStr = maxDate.toISOString().split('T')[0];
            
            dateInput.min = today;
            dateInput.max = maxDateStr;

        }, 50);

        return `
            <div class="booking-page">
                <h2>Reserve a Court</h2>
                <div class="booking-form">
                    <label>Date</label>
                    <input type="date" id="booking-date" value="${new Date().toISOString().split('T')[0]}">
                    
                    <label>Court Type</label>
                    <select id="court-type">
                        <option value="paddle">Paddle</option>
                        <option value="tennis">Tennis</option>
                    </select>

                    <label>Court Number</label>
                    <select id="court-number"></select>

                    <label>Duration (Hours)</label>
                    <select id="duration">
                        <option value="1">1 Hour</option>
                        <option value="2">2 Hours</option>
                        <option value="3">3 Hours</option>
                        <option value="4">4 Hours</option>
                    </select>
                </div>

                <h3>Available Time Slots (08:00 - 22:00)</h3>
                <p>Select a time slot ending with :00 or :30</p>
                <div id="time-slots" class="slots-grid"></div>

                <div id="booking-summary"></div>
                <button id="book-button" class="book-btn-final" disabled>BOOK NOW</button>
            </div>

            <style>
                .booking-page { max-width: 800px; margin: 0 auto; padding: 20px; }
                .booking-form { 
                    display: grid; 
                    grid-template-columns: 1fr 2fr;
                    gap: 15px; 
                    margin: 20px 0; 
                    align-items: center;
                }
                .booking-form label { 
                    font-weight: bold; 
                    text-align: right;
                    padding-right: 10px;
                }
                .booking-form input, 
                .booking-form select { 
                    padding: 10px; 
                    border: 1px solid #ddd; 
                    border-radius: 4px; 
                    font-size: 16px;
                }
                .slots-grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); 
                    gap: 10px; 
                    margin: 20px 0; 
                }
                .time-slot-btn { 
                    padding: 12px 5px; 
                    border: 2px solid #ddd; 
                    background: white;
                    cursor: pointer; 
                    border-radius: 6px; 
                    font-weight: bold;
                    transition: all 0.2s;
                }
                .time-slot-btn:hover { 
                    background: #f0f0f0; 
                    border-color: #999;
                }
                .time-slot-btn.selected { 
                    background: #27ae60; 
                    color: white; 
                    border-color: #27ae60;
                }
                .book-btn-final { 
                    width: 100%; 
                    padding: 15px; 
                    background: #ccc; 
                    border: none; 
                    color: white; 
                    font-weight: bold; 
                    font-size: 18px;
                    cursor: not-allowed; 
                    border-radius: 8px;
                    margin-top: 20px;
                    transition: background 0.3s;
                }
                .book-btn-final.active { 
                    background: #27ae60; 
                    cursor: pointer;
                }
                .book-btn-final.active:hover {
                    background: #219653;
                }
                .summary-card { 
                    background: #f8f9fa; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin: 20px 0; 
                    border-left: 5px solid #27ae60;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .summary-card strong { color: #2c3e50; }
            </style>
        `;
    }
};