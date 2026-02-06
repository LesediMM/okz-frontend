/**
 * OKZ Sports - Booking Page
 * Developed by S.R.C Laboratories
 * Court booking interface
 */

import { validateBooking, sanitizeFormData } from '../utils/validation.js';
import { 
    formatDate, 
    formatTimeSlot, 
    getTodayDate, 
    getMaxBookingDate, 
    generateTimeSlots,
    getNextAvailableTimeSlot,
    isPastTimeSlot
} from '../utils/date.js';
import { showNotification } from '../utils/notification.js';

export default function Booking({ store, router, onNavigate, onShowNotification }) {
    const container = document.createElement('div');
    container.className = 'booking-page';
    
    let availabilityData = null;
    let selectedDate = getTodayDate();
    let selectedCourtType = 'paddle';
    let isLoading = false;
    
    // Render function
    const render = () => {
        if (!store.auth.isAuthenticated()) {
            onNavigate('/login');
            return container;
        }
        
        const user = store.auth.getUser();
        
        container.innerHTML = `
            <div class="booking-container">
                <!-- Header -->
                <div class="booking-header">
                    <h1>Book a Court</h1>
                    <p>Select your preferred court, date, and time</p>
                </div>
                
                <!-- Booking Form -->
                <div class="booking-form-section">
                    <form id="booking-form">
                        <div class="form-row">
                            <!-- Court Type Selection -->
                            <div class="form-group">
                                <label for="courtType">Court Type *</label>
                                <div class="court-type-selector">
                                    <button type="button" class="court-type-btn ${selectedCourtType === 'paddle' ? 'active' : ''}" 
                                            data-type="paddle" id="paddle-btn">
                                        <i class="fas fa-table-tennis-paddle-ball"></i>
                                        <span>Paddle Court</span>
                                        <small>Courts 1-2</small>
                                    </button>
                                    <button type="button" class="court-type-btn ${selectedCourtType === 'tennis' ? 'active' : ''}" 
                                            data-type="tennis" id="tennis-btn">
                                        <i class="fas fa-baseball"></i>
                                        <span>Tennis Court</span>
                                        <small>Courts 3-5</small>
                                    </button>
                                </div>
                                <input type="hidden" id="courtType" name="courtType" value="${selectedCourtType}" required>
                                <div class="error-message" id="court-type-error"></div>
                            </div>
                            
                            <!-- Court Number Selection -->
                            <div class="form-group">
                                <label for="courtNumber">Court Number *</label>
                                <div class="court-number-selector" id="court-number-selector">
                                    <!-- Court numbers will be dynamically generated -->
                                </div>
                                <input type="hidden" id="courtNumber" name="courtNumber" required>
                                <div class="error-message" id="court-number-error"></div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <!-- Date Selection -->
                            <div class="form-group">
                                <label for="date">Date *</label>
                                <input type="date" 
                                       id="date" 
                                       name="date" 
                                       value="${selectedDate}"
                                       min="${getTodayDate()}"
                                       max="${getMaxBookingDate()}"
                                       required>
                                <div class="error-message" id="date-error"></div>
                            </div>
                            
                            <!-- Duration Selection -->
                            <div class="form-group">
                                <label for="duration">Duration *</label>
                                <select id="duration" name="duration" required>
                                    <option value="1">1 hour</option>
                                    <option value="1.5">1.5 hours</option>
                                    <option value="2">2 hours</option>
                                    <option value="2.5">2.5 hours</option>
                                    <option value="3">3 hours</option>
                                    <option value="3.5">3.5 hours</option>
                                    <option value="4">4 hours</option>
                                </select>
                                <div class="error-message" id="duration-error"></div>
                            </div>
                        </div>
                        
                        <!-- Time Slots -->
                        <div class="form-group">
                            <label for="timeSlot">Time Slot *</label>
                            <div class="time-slots-grid" id="time-slots-grid">
                                <!-- Time slots will be dynamically generated -->
                            </div>
                            <input type="hidden" id="timeSlot" name="timeSlot" required>
                            <div class="error-message" id="time-slot-error"></div>
                        </div>
                        
                        <!-- Price Summary -->
                        <div class="price-summary">
                            <div class="price-row">
                                <span>Price per hour:</span>
                                <span>400 EGP</span>
                            </div>
                            <div class="price-row">
                                <span>Duration:</span>
                                <span id="duration-display">1 hour</span>
                            </div>
                            <div class="price-row total">
                                <span>Total:</span>
                                <span id="total-price">400 EGP</span>
                            </div>
                        </div>
                        
                        <!-- Submit Button -->
                        <button type="submit" class="btn btn-primary btn-block" id="book-btn" disabled>
                            <span class="btn-text">Confirm Booking</span>
                            <div class="spinner hidden" id="booking-spinner"></div>
                        </button>
                    </form>
                </div>
                
                <!-- Availability Calendar -->
                <div class="availability-section">
                    <div class="section-header">
                        <h2>Court Availability</h2>
                        <div class="date-navigation">
                            <button id="prev-date" class="btn-icon">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <span id="current-date-display">${formatDate(selectedDate, 'full')}</span>
                            <button id="next-date" class="btn-icon">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="availability-grid" id="availability-grid">
                        <!-- Availability grid will be dynamically generated -->
                    </div>
                    
                    <div class="availability-legend">
                        <div class="legend-item">
                            <div class="legend-color available"></div>
                            <span>Available</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color booked"></div>
                            <span>Booked</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color selected"></div>
                            <span>Selected</span>
                        </div>
                    </div>
                </div>
                
                <!-- Booking Instructions -->
                <div class="instructions-card">
                    <h3><i class="fas fa-info-circle"></i> Important Information</h3>
                    <ul>
                        <li>Operating hours: 8:00 AM - 10:00 PM</li>
                        <li>Maximum booking duration: 4 hours</li>
                        <li>Bookings can be made up to 30 days in advance</li>
                        <li>Cancellation must be made at least 2 hours before booking time</li>
                        <li>Arrive 15 minutes before your scheduled time</li>
                        <li>Bring your ID and booking confirmation</li>
                    </ul>
                </div>
            </div>
        `;
        
        return container;
    };
    
    // Initialize component
    const init = async () => {
        if (!store.auth.isAuthenticated()) {
            onNavigate('/login');
            return;
        }
        
        setupEventListeners();
        generateCourtNumbers();
        await loadAvailability();
        generateTimeSlotsUI();
        updatePrice();
    };
    
    // Setup event listeners
    const setupEventListeners = () => {
        // Court type buttons
        const paddleBtn = container.querySelector('#paddle-btn');
        const tennisBtn = container.querySelector('#tennis-btn');
        
        if (paddleBtn) {
            paddleBtn.addEventListener('click', () => {
                selectedCourtType = 'paddle';
                paddleBtn.classList.add('active');
                tennisBtn.classList.remove('active');
                container.querySelector('#courtType').value = 'paddle';
                generateCourtNumbers();
                loadAvailability();
            });
        }
        
        if (tennisBtn) {
            tennisBtn.addEventListener('click', () => {
                selectedCourtType = 'tennis';
                tennisBtn.classList.add('active');
                paddleBtn.classList.remove('active');
                container.querySelector('#courtType').value = 'tennis';
                generateCourtNumbers();
                loadAvailability();
            });
        }
        
        // Date input
        const dateInput = container.querySelector('#date');
        if (dateInput) {
            dateInput.addEventListener('change', (e) => {
                selectedDate = e.target.value;
                updateDateDisplay();
                loadAvailability();
                generateTimeSlotsUI();
            });
        }
        
        // Duration select
        const durationSelect = container.querySelector('#duration');
        if (durationSelect) {
            durationSelect.addEventListener('change', (e) => {
                updatePrice();
                generateTimeSlotsUI();
            });
        }
        
        // Date navigation
        const prevDateBtn = container.querySelector('#prev-date');
        const nextDateBtn = container.querySelector('#next-date');
        
        if (prevDateBtn) {
            prevDateBtn.addEventListener('click', navigateToPreviousDate);
        }
        
        if (nextDateBtn) {
            nextDateBtn.addEventListener('click', navigateToNextDate);
        }
        
        // Booking form submission
        const bookingForm = container.querySelector('#booking-form');
        if (bookingForm) {
            bookingForm.addEventListener('submit', handleBooking);
        }
    };
    
    // Generate court numbers based on selected court type
    const generateCourtNumbers = () => {
        const courtNumberSelector = container.querySelector('#court-number-selector');
        if (!courtNumberSelector) return;
        
        const courtNumbers = selectedCourtType === 'paddle' ? [1, 2] : [3, 4, 5];
        
        courtNumberSelector.innerHTML = courtNumbers.map(number => `
            <button type="button" class="court-number-btn" data-number="${number}">
                Court ${number}
            </button>
        `).join('');
        
        // Add event listeners to court number buttons
        const courtNumberButtons = courtNumberSelector.querySelectorAll('.court-number-btn');
        courtNumberButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remove active class from all buttons
                courtNumberButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                e.target.classList.add('active');
                
                // Update hidden input
                const courtNumberInput = container.querySelector('#courtNumber');
                if (courtNumberInput) {
                    courtNumberInput.value = e.target.dataset.number;
                }
                
                // Clear error
                const errorElement = container.querySelector('#court-number-error');
                if (errorElement) {
                    errorElement.textContent = '';
                    errorElement.style.display = 'none';
                }
                
                // Enable book button if all required fields are filled
                checkFormValidity();
                
                // Update availability display
                updateAvailabilityDisplay();
            });
        });
    };
    
    // Load availability data
    const loadAvailability = async () => {
        if (isLoading) return;
        
        isLoading = true;
        
        try {
            const response = await store.api.booking.checkAvailability(selectedDate, selectedCourtType);
            availabilityData = response.data.availability || {};
            
            updateAvailabilityDisplay();
            
        } catch (error) {
            console.error('Error loading availability:', error);
            
            if (onShowNotification) {
                onShowNotification({
                    type: 'error',
                    title: 'Load Failed',
                    message: 'Failed to load availability data. Please try again.',
                    duration: 5000
                });
            }
            
        } finally {
            isLoading = false;
        }
    };
    
    // Update availability display
    const updateAvailabilityDisplay = () => {
        const availabilityGrid = container.querySelector('#availability-grid');
        if (!availabilityGrid || !availabilityData) return;
        
        // Get selected court number
        const selectedCourt = container.querySelector('#courtNumber').value;
        
        // Generate availability grid
        let html = '<div class="availability-header">';
        html += '<div class="time-column">Time</div>';
        
        // Court columns
        const courtNumbers = selectedCourtType === 'paddle' ? [1, 2] : [3, 4, 5];
        courtNumbers.forEach(number => {
            const isSelected = selectedCourt === number.toString();
            html += `<div class="court-column ${isSelected ? 'selected' : ''}">Court ${number}</div>`;
        });
        
        html += '</div>';
        
        // Time slots
        for (let hour = 8; hour < 22; hour++) {
            for (let minute of [0, 30]) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                
                html += `<div class="availability-row">`;
                html += `<div class="time-cell">${formatTimeSlot(time)}</div>`;
                
                courtNumbers.forEach(number => {
                    const status = availabilityData[number]?.[time] || 'available';
                    const isSelected = selectedCourt === number.toString();
                    const cellClass = `availability-cell ${status} ${isSelected ? 'court-selected' : ''}`;
                    
                    html += `<div class="${cellClass}" data-court="${number}" data-time="${time}">`;
                    
                    if (status === 'booked') {
                        html += '<i class="fas fa-times"></i>';
                    } else if (status === 'available') {
                        html += '<i class="fas fa-check"></i>';
                    }
                    
                    html += '</div>';
                });
                
                html += '</div>';
            }
        }
        
        availabilityGrid.innerHTML = html;
        
        // Add click handlers to availability cells
        const availabilityCells = availabilityGrid.querySelectorAll('.availability-cell.available');
        availabilityCells.forEach(cell => {
            cell.addEventListener('click', () => {
                const courtNumber = cell.dataset.court;
                const timeSlot = cell.dataset.time;
                
                // Select court number
                const courtNumberButtons = container.querySelectorAll('.court-number-btn');
                courtNumberButtons.forEach(btn => {
                    if (btn.dataset.number === courtNumber) {
                        btn.click();
                    }
                });
                
                // Select time slot
                selectTimeSlot(timeSlot);
                
                // Scroll to time slot in the grid
                cell.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });
    };
    
    // Generate time slots UI
    const generateTimeSlotsUI = () => {
        const timeSlotsGrid = container.querySelector('#time-slots-grid');
        if (!timeSlotsGrid) return;
        
        const duration = parseFloat(container.querySelector('#duration').value);
        const timeSlots = generateTimeSlots(selectedDate, duration);
        
        // Filter out past time slots for today
        const filteredTimeSlots = selectedDate === getTodayDate() 
            ? timeSlots.filter(slot => !isPastTimeSlot(selectedDate, slot.time))
            : timeSlots;
        
        if (filteredTimeSlots.length === 0) {
            timeSlotsGrid.innerHTML = `
                <div class="no-slots-message">
                    <i class="fas fa-clock"></i>
                    <p>No available time slots for the selected duration.</p>
                </div>
            `;
            return;
        }
        
        timeSlotsGrid.innerHTML = filteredTimeSlots.map(slot => `
            <button type="button" class="time-slot-btn" data-time="${slot.time}">
                <span class="time">${slot.display}</span>
                <span class="duration">${duration} hour${duration !== 1 ? 's' : ''}</span>
            </button>
        `).join('');
        
        // Add event listeners to time slot buttons
        const timeSlotButtons = timeSlotsGrid.querySelectorAll('.time-slot-btn');
        timeSlotButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                selectTimeSlot(e.target.dataset.time);
            });
        });
        
        // Auto-select next available time slot for today
        if (selectedDate === getTodayDate()) {
            const nextSlot = getNextAvailableTimeSlot();
            const nextSlotButton = Array.from(timeSlotButtons).find(btn => 
                btn.dataset.time === nextSlot
            );
            if (nextSlotButton) {
                nextSlotButton.click();
            }
        }
    };
    
    // Select time slot
    const selectTimeSlot = (time) => {
        // Remove active class from all time slot buttons
        const timeSlotButtons = container.querySelectorAll('.time-slot-btn');
        timeSlotButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to selected button
        const selectedButton = Array.from(timeSlotButtons).find(btn => btn.dataset.time === time);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }
        
        // Update hidden input
        const timeSlotInput = container.querySelector('#timeSlot');
        if (timeSlotInput) {
            timeSlotInput.value = time;
        }
        
        // Clear error
        const errorElement = container.querySelector('#time-slot-error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        // Enable book button if all required fields are filled
        checkFormValidity();
    };
    
    // Update price display
    const updatePrice = () => {
        const durationSelect = container.querySelector('#duration');
        const durationDisplay = container.querySelector('#duration-display');
        const totalPrice = container.querySelector('#total-price');
        
        if (!durationSelect || !durationDisplay || !totalPrice) return;
        
        const duration = parseFloat(durationSelect.value);
        const total = duration * 400;
        
        durationDisplay.textContent = `${duration} hour${duration !== 1 ? 's' : ''}`;
        totalPrice.textContent = `${total} EGP`;
    };
    
    // Update date display
    const updateDateDisplay = () => {
        const dateDisplay = container.querySelector('#current-date-display');
        const dateInput = container.querySelector('#date');
        
        if (dateDisplay) {
            dateDisplay.textContent = formatDate(selectedDate, 'full');
        }
        
        if (dateInput) {
            dateInput.value = selectedDate;
        }
    };
    
    // Navigate to previous date
    const navigateToPreviousDate = () => {
        const currentDate = new Date(selectedDate);
        currentDate.setDate(currentDate.getDate() - 1);
        
        // Don't allow dates before today
        const today = new Date(getTodayDate());
        if (currentDate >= today) {
            selectedDate = currentDate.toISOString().split('T')[0];
            updateDateDisplay();
            loadAvailability();
            generateTimeSlotsUI();
        }
    };
    
    // Navigate to next date
    const navigateToNextDate = () => {
        const currentDate = new Date(selectedDate);
        currentDate.setDate(currentDate.getDate() + 1);
        
        // Don't allow dates beyond max booking date
        const maxDate = new Date(getMaxBookingDate());
        if (currentDate <= maxDate) {
            selectedDate = currentDate.toISOString().split('T')[0];
            updateDateDisplay();
            loadAvailability();
            generateTimeSlotsUI();
        }
    };
    
    // Check form validity and enable/disable book button
    const checkFormValidity = () => {
        const courtType = container.querySelector('#courtType').value;
        const courtNumber = container.querySelector('#courtNumber').value;
        const date = container.querySelector('#date').value;
        const timeSlot = container.querySelector('#timeSlot').value;
        const duration = container.querySelector('#duration').value;
        
        const isFormValid = courtType && courtNumber && date && timeSlot && duration;
        const bookBtn = container.querySelector('#book-btn');
        
        if (bookBtn) {
            bookBtn.disabled = !isFormValid;
        }
    };
    
    // Handle booking form submission
    const handleBooking = async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
            courtType: formData.get('courtType'),
            courtNumber: parseInt(formData.get('courtNumber')),
            date: formData.get('date'),
            timeSlot: formData.get('timeSlot'),
            duration: parseFloat(formData.get('duration'))
        };
        
        // Validate form data
        const validation = validateBooking(data);
        if (!validation.isValid) {
            // Show validation errors
            Object.keys(validation.errors).forEach(field => {
                const errorElement = container.querySelector(`#${field}-error`);
                if (errorElement) {
                    errorElement.textContent = validation.errors[field];
                    errorElement.style.display = 'block';
                }
            });
            return;
        }
        
        // Sanitize data
        const sanitizedData = sanitizeFormData(data);
        
        // Show loading state
        const bookBtn = container.querySelector('#book-btn');
        const btnText = container.querySelector('.btn-text');
        const spinner = container.querySelector('#booking-spinner');
        
        if (bookBtn && btnText && spinner) {
            bookBtn.disabled = true;
            btnText.textContent = 'Processing...';
            spinner.classList.remove('hidden');
        }
        
        try {
            // Create booking
            const response = await store.api.booking.createBooking(sanitizedData);
            
            // Show success notification
            if (onShowNotification) {
                onShowNotification({
                    type: 'success',
                    title: 'Booking Confirmed!',
                    message: `Court ${sanitizedData.courtNumber} booked for ${formatDate(sanitizedData.date, 'full')} at ${sanitizedData.timeSlot}`,
                    duration: 5000
                });
            }
            
            // Redirect to my bookings page after a delay
            setTimeout(() => {
                onNavigate('/my-bookings');
            }, 2000);
            
        } catch (error) {
            console.error('Booking error:', error);
            
            // Show error notification
            if (onShowNotification) {
                onShowNotification({
                    type: 'error',
                    title: 'Booking Failed',
                    message: error.message || 'Failed to create booking. Please try again.',
                    duration: 5000
                });
            }
            
            // Handle specific errors
            if (error.message.includes('COURT_CONFLICT') || error.message.includes('409')) {
                const timeSlotError = container.querySelector('#time-slot-error');
                if (timeSlotError) {
                    timeSlotError.textContent = 'This time slot is no longer available. Please select another time.';
                    timeSlotError.style.display = 'block';
                }
                
                // Reload availability
                await loadAvailability();
            }
            
        } finally {
            // Reset button state
            if (bookBtn && btnText && spinner) {
                bookBtn.disabled = false;
                btnText.textContent = 'Confirm Booking';
                spinner.classList.add('hidden');
            }
        }
    };
    
    return {
        render,
        init
    };
}