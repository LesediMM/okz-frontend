/**
 * src/pages/Booking.js
 * 100% Manual Routing Version - No Hash Routing
 */

import UserLogin from './UserLogin.js';
import MyBookings from './MyBookings.js';

export default {
    render: () => {
        // Trigger the logic after the string is returned to ensure HTML is in the DOM
        setTimeout(() => {
            const app = document.getElementById('app');
            const dateInput = document.getElementById('booking-date');
            const typeSelect = document.getElementById('court-type');
            const courtSelect = document.getElementById('court-number');
            const durationSelect = document.getElementById('duration');
            const timeContainer = document.getElementById('time-slots');
            const bookButton = document.getElementById('book-button');
            const bookingSummary = document.getElementById('booking-summary');
            
            let selectedTime = null;

            // Session Check - Manual Redirect
            const userId = localStorage.getItem('okz_user_id');
            if (!userId) {
                app.innerHTML = UserLogin.render();
                if (UserLogin.afterRender) UserLogin.afterRender();
                return;
            }

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
                    if (hour < 22) {
                        const time00 = `${hour.toString().padStart(2, '0')}:00`;
                        timeContainer.appendChild(createTimeSlotButton(time00));
                    }
                    if (hour >= 8 && hour <= 21) {
                        const time30 = `${hour.toString().padStart(2, '0')}:30`;
                        timeContainer.appendChild(createTimeSlotButton(time30));
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
                const isPaddle = typeSelect.value === 'paddle';
                const courts = isPaddle 
                    ? [{ v: 1, t: 'Paddle Court 1' }, { v: 2, t: 'Paddle Court 2' }]
                    : [{ v: 3, t: 'Tennis Court 1' }, { v: 4, t: 'Tennis Court 2' }, { v: 5, t: 'Tennis Court 3' }];
                
                courts.forEach(c => {
                    const opt = document.createElement('option');
                    opt.value = c.v;
                    opt.textContent = c.t;
                    courtSelect.appendChild(opt);
                });
                updateBookingSummary();
            };

            bookButton.onclick = async () => {
                const bookingData = {
                    courtType: typeSelect.value,
                    courtNumber: Number(courtSelect.value),
                    date: dateInput.value,
                    timeSlot: selectedTime,
                    duration: Number(durationSelect.value)
                };

                // Basic validation
                if (!bookingData.date || !bookingData.timeSlot) {
                    alert("Please complete the booking details.");
                    return;
                }

                bookButton.innerText = "Processing...";
                bookButton.disabled = true;

                try {
                    const res = await fetch('https://okz.onrender.com/api/v1/bookings', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json', 
                            'x-user-id': userId,
                            'Origin': 'https://okz-frontend.onrender.com'
                        },
                        body: JSON.stringify(bookingData)
                    });

                    const responseData = await res.json();
                    
                    if (res.ok) { 
                        alert("Court reserved successfully!"); 
                        
                        // MANUAL NAVIGATION to MyBookings
                        app.innerHTML = MyBookings.render();
                        if (MyBookings.afterRender) await MyBookings.afterRender();
                    } else { 
                        alert(`Booking failed: ${responseData.message || "Please try another slot."}`); 
                        bookButton.innerText = "BOOK NOW";
                        bookButton.disabled = false;
                    }
                } catch (e) { 
                    alert("Network error."); 
                    bookButton.innerText = "BOOK NOW";
                    bookButton.disabled = false;
                }
            };

            // Init
            updateCourts();
            generateTimeSlots();
            dateInput.onchange = updateBookingSummary;
            typeSelect.onchange = updateCourts;
            courtSelect.onchange = updateBookingSummary;
            durationSelect.onchange = updateBookingSummary;

            const todayStr = new Date().toISOString().split('T')[0];
            dateInput.min = todayStr;
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
                    </select>
                </div>

                <h3>Available Time Slots</h3>
                <div id="time-slots" class="slots-grid"></div>

                <div id="booking-summary"></div>
                <button id="book-button" class="book-btn-final" disabled>BOOK NOW</button>
            </div>
            <style>
                .booking-page { max-width: 800px; margin: 0 auto; padding: 20px; font-family: sans-serif; }
                .booking-form { display: grid; grid-template-columns: 1fr 2fr; gap: 15px; margin: 20px 0; align-items: center; }
                .slots-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; margin: 20px 0; }
                .time-slot-btn { padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px; }
                .time-slot-btn.selected { background: #27ae60; color: white; border-color: #27ae60; }
                .book-btn-final { width: 100%; padding: 15px; background: #ccc; border: none; color: white; font-weight: bold; border-radius: 8px; cursor: not-allowed; }
                .book-btn-final.active { background: #27ae60; cursor: pointer; }
                .summary-card { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 5px solid #27ae60; }
            </style>
        `;
    }
};