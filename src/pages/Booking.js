/**
 * src/pages/Booking.js
 * 100% Manual Routing Version - No Hash Routing
 * Updated with sessionStorage and proper headers
 */

import UserLogin from './UserLogin.js';
import MyBookings from './MyBookings.js';

export default {
    render: () => {
        console.log('🔧 Booking page render started...');
        
        // We'll store the cleanup function to avoid memory leaks
        let cleanupFunctions = [];
        
        // Trigger the logic after the string is returned to ensure HTML is in the DOM
        setTimeout(() => {
            console.log('🎯 Booking page DOM initialization...');
            
            const app = document.getElementById('app');
            const dateInput = document.getElementById('booking-date');
            const typeSelect = document.getElementById('court-type');
            const courtSelect = document.getElementById('court-number');
            const durationSelect = document.getElementById('duration');
            const timeContainer = document.getElementById('time-slots');
            const bookButton = document.getElementById('book-button');
            const bookingSummary = document.getElementById('booking-summary');
            
            let selectedTime = null;

            // Session Check - Manual Redirect (check both storages)
            const sessionUserId = sessionStorage.getItem('okz_user_id');
            const localUserId = localStorage.getItem('okz_user_id');
            const userId = sessionUserId || localUserId;
            
            console.log('🔐 User ID check for booking:');
            console.log('- SessionStorage:', sessionUserId);
            console.log('- LocalStorage:', localUserId);
            console.log('- Selected userId:', userId);

            if (!userId) {
                console.log('❌ No user ID found, redirecting to login...');
                app.innerHTML = UserLogin.render();
                if (UserLogin.afterRender) UserLogin.afterRender();
                return;
            }

            console.log('✅ User authenticated, setting up booking form...');

            const updateBookingSummary = () => {
                if (dateInput.value && courtSelect.value && selectedTime) {
                    const duration = parseInt(durationSelect.value);
                    const price = duration * 400;
                    bookingSummary.innerHTML = `
                        <div class="summary-card">
                            <strong>Booking Summary:</strong><br>
                            📅 <strong>Date:</strong> ${dateInput.value}<br>
                            ⏰ <strong>Time:</strong> ${selectedTime}<br>
                            ⏳ <strong>Duration:</strong> ${duration} hour${duration > 1 ? 's' : ''}<br>
                            💰 <strong>Total:</strong> ${price} EGP
                        </div>`;
                    bookButton.disabled = false;
                    bookButton.classList.add('active');
                    bookButton.title = "Click to confirm booking";
                } else {
                    bookingSummary.innerHTML = `
                        <div class="summary-card incomplete">
                            <strong>Complete all fields to book:</strong><br>
                            📅 Select a date<br>
                            🎾 Choose court type and number<br>
                            ⏰ Pick a time slot
                        </div>`;
                    bookButton.disabled = true;
                    bookButton.classList.remove('active');
                    bookButton.title = "Please complete all booking details";
                }
            };

            const generateTimeSlots = () => {
                console.log('⏰ Generating time slots...');
                timeContainer.innerHTML = '';
                for (let hour = 8; hour <= 22; hour++) {
                    if (hour < 22) {
                        const time00 = `${hour.toString().padStart(2, '0')}:00`;
                        const btn00 = createTimeSlotButton(time00);
                        timeContainer.appendChild(btn00);
                        cleanupFunctions.push(() => btn00.onclick = null);
                    }
                    if (hour >= 8 && hour <= 21) {
                        const time30 = `${hour.toString().padStart(2, '0')}:30`;
                        const btn30 = createTimeSlotButton(time30);
                        timeContainer.appendChild(btn30);
                        cleanupFunctions.push(() => btn30.onclick = null);
                    }
                }
            };

            const createTimeSlotButton = (time) => {
                const btn = document.createElement('button');
                btn.className = 'time-slot-btn';
                btn.innerText = time;
                btn.title = `Select ${time} time slot`;
                
                const clickHandler = () => {
                    console.log(`🕒 Time slot selected: ${time}`);
                    document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    selectedTime = time;
                    updateBookingSummary();
                };
                
                btn.onclick = clickHandler;
                return btn;
            };

            const updateCourts = () => {
                console.log(`🎾 Updating courts for type: ${typeSelect.value}`);
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

            const bookCourt = async () => {
                const bookingData = {
                    courtType: typeSelect.value,
                    courtNumber: Number(courtSelect.value),
                    date: dateInput.value,
                    timeSlot: selectedTime,
                    duration: Number(durationSelect.value)
                };

                console.log('📤 Booking data:', bookingData);

                // Basic validation
                if (!bookingData.date || !bookingData.timeSlot) {
                    alert("⚠️ Please complete the booking details.");
                    return;
                }

                bookButton.innerText = "Processing...";
                bookButton.disabled = true;

                try {
                    console.log('📤 Sending booking request to API...');
                    console.log('Request headers:', {
                        'x-user-id': userId,
                        'X-User-ID': userId,
                        'Origin': 'https://okz-frontend.onrender.com',
                        'Content-Type': 'application/json'
                    });
                    
                    const res = await fetch('https://okz.onrender.com/api/v1/bookings', {
                        method: 'POST',
                        mode: 'cors',
                        headers: { 
                            'Content-Type': 'application/json',
                            'x-user-id': userId,
                            'X-User-ID': userId,
                            'Origin': 'https://okz-frontend.onrender.com'
                        },
                        body: JSON.stringify(bookingData)
                    });

                    console.log('📥 Booking response status:', res.status);
                    
                    const responseData = await res.json();
                    console.log('📥 Booking response data:', responseData);
                    
                    if (res.ok && responseData.status === 'success') { 
                        console.log('✅ Court reserved successfully!');
                        alert("🎉 Court reserved successfully!"); 
                        
                        // MANUAL NAVIGATION to MyBookings
                        console.log('🚀 Navigating to MyBookings...');
                        app.innerHTML = MyBookings.render();
                        if (MyBookings.afterRender) await MyBookings.afterRender();
                    } else { 
                        console.error('❌ Booking failed:', responseData);
                        const errorMsg = responseData.message || "Please try another slot.";
                        const detailedMsg = responseData.errors 
                            ? errorMsg + "\n" + responseData.errors.map(e => `• ${e.message}`).join('\n')
                            : errorMsg;
                        
                        alert(`❌ Booking failed:\n${detailedMsg}`); 
                        bookButton.innerText = "BOOK NOW";
                        bookButton.disabled = false;
                    }
                } catch (e) { 
                    console.error('❌ Network error during booking:', e);
                    alert("🌐 Network error. Please check your connection and try again."); 
                    bookButton.innerText = "BOOK NOW";
                    bookButton.disabled = false;
                }
            };

            // Setup event listeners with cleanup
            const setupEventListeners = () => {
                console.log('🔗 Setting up event listeners...');
                
                const dateHandler = () => updateBookingSummary();
                const typeHandler = () => updateCourts();
                const courtHandler = () => updateBookingSummary();
                const durationHandler = () => updateBookingSummary();
                const bookHandler = () => bookCourt();
                
                dateInput.addEventListener('change', dateHandler);
                typeSelect.addEventListener('change', typeHandler);
                courtSelect.addEventListener('change', courtHandler);
                durationSelect.addEventListener('change', durationHandler);
                bookButton.addEventListener('click', bookHandler);
                
                // Store cleanup functions
                cleanupFunctions.push(
                    () => dateInput.removeEventListener('change', dateHandler),
                    () => typeSelect.removeEventListener('change', typeHandler),
                    () => courtSelect.removeEventListener('change', courtHandler),
                    () => durationSelect.removeEventListener('change', durationHandler),
                    () => bookButton.removeEventListener('click', bookHandler)
                );
            };

            // Initial setup
            updateCourts();
            generateTimeSlots();
            setupEventListeners();
            
            // Set minimum date to today
            const todayStr = new Date().toISOString().split('T')[0];
            dateInput.min = todayStr;
            dateInput.value = todayStr;
            
            // Initial summary update
            updateBookingSummary();
            
            console.log('✅ Booking page initialization complete');
            
        }, 50);

        return `
            <div class="booking-page">
                <div class="booking-header">
                    <h2>🎾 Reserve a Court</h2>
                    <p>Book your paddle or tennis court session</p>
                </div>
                
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
                    <p class="booking-note">✅ Payment can be completed at the venue</p>
                </div>
            </div>
            <style>
                .booking-page { 
                    max-width: 800px; 
                    margin: 0 auto; 
                    padding: 20px; 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .booking-header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #f0f0f0;
                    padding-bottom: 20px;
                }
                .booking-header h2 {
                    color: #2c3e50;
                    margin-bottom: 8px;
                }
                .booking-header p {
                    color: #7f8c8d;
                    font-size: 16px;
                }
                .booking-form { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                    gap: 20px; 
                    margin: 30px 0; 
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                }
                .form-group label {
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: #2c3e50;
                    font-size: 14px;
                }
                .form-control {
                    padding: 12px 15px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 16px;
                    transition: border-color 0.3s;
                }
                .form-control:focus {
                    outline: none;
                    border-color: #27ae60;
                    box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
                }
                .time-slots-section {
                    margin: 30px 0;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 10px;
                }
                .time-slots-section h3 {
                    margin-bottom: 15px;
                    color: #2c3e50;
                }
                .slots-grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fill, minmax(85px, 1fr)); 
                    gap: 12px; 
                }
                .time-slot-btn { 
                    padding: 12px 8px; 
                    border: 2px solid #ddd; 
                    background: white; 
                    cursor: pointer; 
                    border-radius: 6px; 
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .time-slot-btn:hover { 
                    border-color: #3498db; 
                    background: #f8f9fa;
                }
                .time-slot-btn.selected { 
                    background: #27ae60; 
                    color: white; 
                    border-color: #27ae60; 
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(39, 174, 96, 0.3);
                }
                .booking-summary-container {
                    margin: 25px 0;
                }
                .summary-card {
                    background: #f8f9fa; 
                    padding: 20px; 
                    border-radius: 10px; 
                    border-left: 5px solid #27ae60;
                    line-height: 1.6;
                }
                .summary-card.incomplete {
                    border-left-color: #f39c12;
                    background: #fff8e1;
                }
                .summary-card strong {
                    color: #2c3e50;
                    font-size: 16px;
                    display: block;
                    margin-bottom: 10px;
                }
                .booking-actions {
                    margin-top: 30px;
                }
                .book-btn-final { 
                    width: 100%; 
                    padding: 18px; 
                    background: #ccc; 
                    border: none; 
                    color: white; 
                    font-weight: bold; 
                    border-radius: 10px; 
                    cursor: not-allowed; 
                    font-size: 18px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: all 0.3s;
                }
                .book-btn-final.active { 
                    background: linear-gradient(135deg, #27ae60, #2ecc71); 
                    cursor: pointer; 
                    box-shadow: 0 4px 15px rgba(39, 174, 96, 0.4);
                }
                .book-btn-final.active:hover { 
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(39, 174, 96, 0.5);
                }
                .btn-price {
                    background: rgba(255,255,255,0.2);
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 14px;
                }
                .booking-note {
                    text-align: center;
                    margin-top: 15px;
                    color: #7f8c8d;
                    font-size: 14px;
                }
                @media (max-width: 600px) {
                    .booking-form {
                        grid-template-columns: 1fr;
                    }
                    .slots-grid {
                        grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
                    }
                }
            </style>
        `;
    },
    
    // Optional: Cleanup function to prevent memory leaks
    cleanup: () => {
        console.log('🧹 Cleaning up Booking page event listeners...');
        // If we had stored cleanup functions, we'd call them here
        // For now, the setTimeout approach makes cleanup tricky
    }
};