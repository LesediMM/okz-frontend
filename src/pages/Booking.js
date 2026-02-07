/**
 * src/pages/Booking.js
 * Modified Booking Page - Single Communication Version
 * All selections are made locally, then sent to backend with BOOK button.
 */

export default {
    render: () => `
        <div class="booking-container">
            <div class="booking-header">
                <h2>Reserve a Court</h2>
                <p>Select your preferences below and click BOOK to confirm your reservation.</p>
            </div>
            
            <div class="booking-form-grid">
                <div class="form-group">
                    <label>1. Select Date</label>
                    <input type="date" id="booking-date" min="${new Date().toISOString().split('T')[0]}" value="${new Date().toISOString().split('T')[0]}">
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

            <div id="time-selection-section" class="availability-section">
                <h3>5. Select Time Slot</h3>
                <p id="time-hint">Choose your preferred start time</p>
                <div id="time-slots" class="availability-grid">
                    <!-- Time slots will be generated here -->
                </div>
            </div>

            <div class="booking-confirm-section">
                <button id="book-button" class="book-button" disabled>
                    BOOK NOW
                </button>
                <p id="booking-summary" class="booking-summary"></p>
            </div>
            
            <style>
                /* Time slot button styling */
                .time-slot-btn {
                    padding: 12px 20px;
                    margin: 5px;
                    background-color: #f0f0f0;
                    border: 2px solid #ddd;
                    border-radius: 6px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .time-slot-btn:hover {
                    background-color: #e0e0e0;
                    border-color: #ccc;
                }
                
                .time-slot-btn.selected {
                    background-color: #4CAF50;
                    color: white;
                    border-color: #45a049;
                    font-weight: bold;
                    transform: scale(1.05);
                    box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
                }
                
                /* BOOK button styling */
                .book-button {
                    padding: 16px 50px;
                    font-size: 20px;
                    font-weight: bold;
                    background-color: #ccc;
                    color: #666;
                    border: none;
                    border-radius: 8px;
                    cursor: not-allowed;
                    transition: all 0.3s ease;
                    margin-top: 20px;
                    width: 100%;
                    max-width: 300px;
                }
                
                .book-button.active {
                    background-color: #4CAF50;
                    color: white;
                    cursor: pointer;
                    box-shadow: 0 6px 12px rgba(76, 175, 80, 0.3);
                }
                
                .book-button.active:hover {
                    background-color: #45a049;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(76, 175, 80, 0.4);
                }
                
                .book-button.active:active {
                    transform: translateY(0);
                    box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
                }
                
                /* Booking summary styling */
                .booking-summary {
                    margin-top: 20px;
                    padding: 20px;
                    background-color: #f9f9f9;
                    border-radius: 8px;
                    border-left: 5px solid #4CAF50;
                    font-size: 16px;
                    line-height: 1.6;
                    max-width: 400px;
                    margin-left: auto;
                    margin-right: auto;
                }
                
                .booking-summary strong {
                    color: #333;
                    font-size: 18px;
                    display: block;
                    margin-bottom: 10px;
                }
                
                /* Loading spinner styling */
                .loading-spinner {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 3px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top-color: #ffffff;
                    animation: spin 1s linear infinite;
                    margin-right: 10px;
                    vertical-align: middle;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .time-slot-btn {
                        padding: 10px 15px;
                        font-size: 14px;
                        margin: 3px;
                    }
                    
                    .book-button {
                        padding: 14px 30px;
                        font-size: 18px;
                        max-width: 250px;
                    }
                    
                    .booking-summary {
                        padding: 15px;
                        font-size: 14px;
                    }
                }
                
                @media (max-width: 480px) {
                    .time-slot-btn {
                        padding: 8px 12px;
                        font-size: 13px;
                    }
                    
                    .book-button {
                        padding: 12px 20px;
                        font-size: 16px;
                        max-width: 200px;
                    }
                }
            </style>
        </div>
    `,

    afterRender: () => {
        const dateInput = document.getElementById('booking-date');
        const typeInput = document.getElementById('court-type');
        const courtSelect = document.getElementById('court-number');
        const durationSelect = document.getElementById('duration');
        const timeContainer = document.getElementById('time-slots');
        const hint = document.getElementById('time-hint');
        const bookButton = document.getElementById('book-button');
        const bookingSummary = document.getElementById('booking-summary');
        
        let selectedTime = null;

        // Generate time slots from 8 AM to 10 PM
        const generateTimeSlots = () => {
            timeContainer.innerHTML = '';
            selectedTime = null;
            
            // Create time slots from 8:00 to 22:00 (10 PM)
            for (let hour = 8; hour <= 22; hour++) {
                const timeString = `${hour.toString().padStart(2, '0')}:00`;
                const btn = document.createElement('button');
                btn.className = 'time-slot-btn';
                btn.innerText = timeString;
                btn.dataset.time = timeString;
                btn.onclick = () => selectTimeSlot(timeString, btn);
                timeContainer.appendChild(btn);
            }
            
            updateBookButtonState();
            updateBookingSummary();
        };

        // Update court selection dropdown based on type
        const updateCourts = () => {
            courtSelect.innerHTML = typeInput.value === 'paddle' 
                ? '<option value="1">Paddle Court 1</option><option value="2">Paddle Court 2</option>'
                : '<option value="3">Tennis Court 1</option><option value="4">Tennis Court 2</option><option value="5">Tennis Court 3</option>';
            
            updateBookButtonState();
            updateBookingSummary();
        };

        // Handle time slot selection
        const selectTimeSlot = (time, buttonElement) => {
            // Reset all buttons
            document.querySelectorAll('.time-slot-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            // Select this button
            buttonElement.classList.add('selected');
            selectedTime = time;
            
            updateBookButtonState();
            updateBookingSummary();
        };

        // Update BOOK button state based on selections
        const updateBookButtonState = () => {
            const isComplete = dateInput.value && courtSelect.value && selectedTime && durationSelect.value;
            
            if (isComplete) {
                bookButton.disabled = false;
                bookButton.classList.add('active');
            } else {
                bookButton.disabled = true;
                bookButton.classList.remove('active');
            }
        };

        // Update booking summary
        const updateBookingSummary = () => {
            if (dateInput.value && courtSelect.value && selectedTime && durationSelect.value) {
                const duration = parseInt(durationSelect.value);
                const price = duration * 400;
                const courtName = courtSelect.options[courtSelect.selectedIndex].text;
                
                bookingSummary.innerHTML = `
                    <strong>Reservation Summary:</strong><br>
                    Date: ${dateInput.value}<br>
                    Court: ${courtName}<br>
                    Time: ${selectedTime}<br>
                    Duration: ${duration} hour(s)<br>
                    Total: ${price} EGP
                `;
            } else {
                bookingSummary.innerHTML = 'Complete all selections above to see booking summary.';
            }
        };

        // Make booking - SINGLE BACKEND COMMUNICATION
        const makeBooking = async () => {
            // Validate all required fields
            if (!dateInput.value || !courtSelect.value || !selectedTime || !durationSelect.value) {
                alert("Please complete all selections before booking.");
                return;
            }

            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert("Session expired. Please login again.");
                window.location.hash = '#/login';
                return;
            }

            // Disable button and show loading state
            bookButton.disabled = true;
            bookButton.innerHTML = '<span class="loading-spinner"></span> Processing...';

            const bookingData = {
                courtNumber: parseInt(courtSelect.value),
                date: dateInput.value,
                timeSlot: selectedTime,
                duration: parseInt(durationSelect.value),
                price: parseInt(durationSelect.value) * 400
            };

            try {
                // SINGLE API CALL - only when BOOK button is clicked
                const response = await fetch('https://okz.onrender.com/api/v1/bookings', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify(bookingData)
                });

                const result = await response.json();

                if (response.ok && result.status === 'success') {
                    alert(`Booking confirmed! Court ${bookingData.courtNumber} is reserved for ${selectedTime} on ${dateInput.value}.`);
                    window.location.hash = '#/my-bookings';
                } else {
                    alert("Booking Failed: " + (result.message || "Unknown error. Please try again."));
                    bookButton.disabled = false;
                    bookButton.innerHTML = 'BOOK NOW';
                    updateBookButtonState();
                }
            } catch (err) {
                console.error('Booking error:', err);
                alert("Network error. Please check your connection and try again.");
                bookButton.disabled = false;
                bookButton.innerHTML = 'BOOK NOW';
                updateBookButtonState();
            }
        };

        // Event Listeners
        dateInput.addEventListener('change', () => {
            updateBookButtonState();
            updateBookingSummary();
        });
        
        typeInput.addEventListener('change', () => {
            updateCourts();
            updateBookingSummary();
        });
        
        courtSelect.addEventListener('change', () => {
            updateBookButtonState();
            updateBookingSummary();
        });
        
        durationSelect.addEventListener('change', () => {
            updateBookButtonState();
            updateBookingSummary();
        });
        
        bookButton.addEventListener('click', makeBooking);

        // Initial Setup
        updateCourts();
        generateTimeSlots();
        updateBookingSummary();
    }
};