/**
 * src/pages/Booking.js
 * 100% Manual Routing Version - Zero Storage Frontend
 */

import UserLogin from './UserLogin.js';
import MyBookings from './MyBookings.js';

export default {
    render: () => {
        setTimeout(() => {
            const app = document.getElementById('app');
            const dateInput = document.getElementById('booking-date');
            const typeSelect = document.getElementById('court-type');
            const courtSelect = document.getElementById('court-number');
            const durationSelect = document.getElementById('duration');
            const timeContainer = document.getElementById('time-slots');
            const bookButton = document.getElementById('book-button');
            const bookingSummary = document.getElementById('booking-summary');
            const emailInput = document.getElementById('booking-email');
            const emailForm = document.querySelector('.email-form');
            const bookingForm = document.querySelector('.booking-form-section');
            
            let selectedTime = null;
            let userEmail = '';

            // Show email form first - FIXED WITH PROPER VALIDATION
            document.getElementById('verify-email-btn').addEventListener('click', () => {
                // Clean email aggressively
                let email = emailInput.value
                    .trim()
                    .toLowerCase()
                    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width chars
                    .replace(/\s+/g, ''); // Remove ALL whitespace
                
                console.log('Cleaned email:', email); // Debug logging
                
                if (!email) {
                    alert('Please enter your email address');
                    return;
                }
                
                // Validate email format strictly
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!emailRegex.test(email)) {
                    alert('Please enter a valid email address\nExample: name@domain.com');
                    return;
                }

                userEmail = email;
                emailForm.style.display = 'none';
                bookingForm.style.display = 'block';
                setupBookingForm();
            });

            const setupBookingForm = () => {
                const updateBookingSummary = () => {
                    if (dateInput.value && courtSelect.value && selectedTime) {
                        const duration = parseInt(durationSelect.value);
                        const price = duration * 400;
                        bookingSummary.innerHTML = `
                            <div class="summary-card">
                                <strong>Booking for: ${userEmail}</strong><br>
                                📅 <strong>Date:</strong> ${dateInput.value}<br>
                                ⏰ <strong>Time:</strong> ${selectedTime}<br>
                                ⏳ <strong>Duration:</strong> ${duration} hour${duration > 1 ? 's' : ''}<br>
                                💰 <strong>Total:</strong> ${price} EGP
                            </div>`;
                        bookButton.disabled = false;
                        bookButton.classList.add('active');
                    } else {
                        bookingSummary.innerHTML = `
                            <div class="summary-card incomplete">
                                <strong>Complete all fields to book</strong>
                            </div>`;
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
                    // Debug: log what email is being sent
                    console.log('=== Booking Debug ===');
                    console.log('Email to send:', userEmail);
                    console.log('Email validation:', /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userEmail));
                    
                    const bookingData = {
                        courtType: typeSelect.value,
                        courtNumber: Number(courtSelect.value),
                        date: dateInput.value,
                        timeSlot: selectedTime,
                        duration: Number(durationSelect.value)
                    };

                    if (!bookingData.date || !bookingData.timeSlot) {
                        alert("Please complete the booking details.");
                        return;
                    }

                    bookButton.innerText = "Processing...";
                    bookButton.disabled = true;

                    try {
                        console.log('Sending booking request with email:', userEmail);
                        
                        const res = await fetch('https://okz.onrender.com/api/v1/bookings', {
                            method: 'POST',
                            headers: { 
                                'Content-Type': 'application/json',
                                'x-user-email': userEmail,
                                'X-User-Email': userEmail,
                                'Origin': 'https://okz-frontend.onrender.com'
                            },
                            body: JSON.stringify(bookingData)
                        });

                        const responseData = await res.json();
                        console.log('Backend response:', responseData);
                        
                        if (res.ok) { 
                            alert("Court reserved successfully!"); 
                            
                            // Navigate to MyBookings
                            app.innerHTML = MyBookings.render();
                            if (MyBookings.afterRender) await MyBookings.afterRender();
                        } else { 
                            alert(`Booking failed: ${responseData.message || "Please try another slot."}`); 
                            bookButton.innerText = "BOOK NOW";
                            bookButton.disabled = false;
                        }
                    } catch (e) { 
                        console.error('Network error:', e);
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
                dateInput.value = todayStr;
            };
        }, 50);

        return `
            <div class="booking-page">
                <div class="booking-header">
                    <h2>🎾 Reserve a Court</h2>
                </div>
                
                <div class="email-form">
                    <div class="form-group">
                        <label for="booking-email">Your Email Address</label>
                        <input type="email" id="booking-email" placeholder="Enter your registered email" required>
                        <p class="form-help">We'll use this email to identify your booking</p>
                    </div>
                    <button id="verify-email-btn" class="btn btn-primary">Continue to Booking</button>
                </div>
                
                <div class="booking-form-section" style="display: none;">
                    <div class="booking-form">
                        <div class="form-group">
                            <label for="booking-date">📅 Date</label>
                            <input type="date" id="booking-date" class="form-control">
                        </div>
                        
                        <div class="form-group">
                            <label for="court-type">🎾 Court Type</label>
                            <select id="court-type" class="form-control">
                                <option value="paddle">Paddle Court</option>
                                <option value="tennis">Tennis Court</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="court-number">🏟️ Court Number</label>
                            <select id="court-number" class="form-control"></select>
                        </div>

                        <div class="form-group">
                            <label for="duration">⏳ Duration (Hours)</label>
                            <select id="duration" class="form-control">
                                <option value="1">1 Hour - 400 EGP</option>
                                <option value="2">2 Hours - 800 EGP</option>
                            </select>
                        </div>
                    </div>

                    <div class="time-slots-section">
                        <h3>⏰ Available Time Slots (8:00 AM - 10:00 PM)</h3>
                        <div id="time-slots" class="slots-grid"></div>
                    </div>

                    <div id="booking-summary" class="booking-summary-container"></div>
                    
                    <div class="booking-actions">
                        <button id="book-button" class="book-btn-final" disabled>
                            <span class="btn-text">BOOK NOW</span>
                            <span class="btn-price">400 EGP/hour</span>
                        </button>
                    </div>
                </div>
            </div>
            <style>
                .booking-page { max-width: 800px; margin: 0 auto; padding: 20px; }
                .email-form { margin: 30px 0; }
                .form-group { margin-bottom: 20px; }
                .form-help { font-size: 12px; color: #666; margin-top: 5px; }
                .booking-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
                .slots-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(85px, 1fr)); gap: 12px; margin: 20px 0; }
                .time-slot-btn { padding: 12px 8px; border: 2px solid #ddd; background: white; cursor: pointer; border-radius: 6px; }
                .time-slot-btn.selected { background: #27ae60; color: white; border-color: #27ae60; }
                .book-btn-final { width: 100%; padding: 18px; background: #ccc; border: none; color: white; font-weight: bold; border-radius: 10px; cursor: not-allowed; }
                .book-btn-final.active { background: #27ae60; cursor: pointer; }
                .summary-card { background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 5px solid #27ae60; }
            </style>
        `;
    }
};