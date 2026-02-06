/**
 * OKZ Sports - Booking Form Component
 * Developed by S.R.C Laboratories
 * Reusable booking form component
 */

import { formatDate, generateTimeSlots, getTodayDate, getMaxBookingDate } from '../utils/date.js';

export default function BookingForm(props) {
    const {
        initialData = {},
        onBookingSubmit = null,
        onCancel = null,
        loading = false,
        errors = {},
        courtType = 'paddle',
        courtNumber = 1,
        showCourtSelection = true
    } = props;
    
    const container = document.createElement('form');
    container.className = 'booking-form';
    
    // Initial values
    const initialValues = {
        courtType: initialData.courtType || courtType,
        courtNumber: initialData.courtNumber || courtNumber,
        date: initialData.date || getTodayDate(),
        timeSlot: initialData.timeSlot || '',
        duration: initialData.duration || 1,
        ...initialData
    };
    
    // Render function
    const render = () => {
        const timeSlots = generateTimeSlots(initialValues.date, initialValues.duration);
        
        container.innerHTML = `
            <div class="form-section">
                <h3 class="form-section-title">Court Details</h3>
                
                ${showCourtSelection ? `
                    <div class="form-row">
                        <div class="form-group">
                            <label for="courtType">Court Type *</label>
                            <div class="court-type-selector">
                                <button type="button" class="court-type-btn ${initialValues.courtType === 'paddle' ? 'active' : ''}" 
                                        data-type="paddle" id="paddle-btn">
                                    <i class="fas fa-table-tennis-paddle-ball"></i>
                                    <span>Paddle Court</span>
                                </button>
                                <button type="button" class="court-type-btn ${initialValues.courtType === 'tennis' ? 'active' : ''}" 
                                        data-type="tennis" id="tennis-btn">
                                    <i class="fas fa-baseball"></i>
                                    <span>Tennis Court</span>
                                </button>
                            </div>
                            <input type="hidden" id="courtType" name="courtType" value="${initialValues.courtType}" required>
                            ${errors.courtType ? `<div class="form-error">${errors.courtType}</div>` : ''}
                        </div>
                        
                        <div class="form-group">
                            <label for="courtNumber">Court Number *</label>
                            <div class="court-number-selector" id="court-number-selector">
                                <!-- Court numbers will be dynamically generated -->
                            </div>
                            <input type="hidden" id="courtNumber" name="courtNumber" value="${initialValues.courtNumber}" required>
                            ${errors.courtNumber ? `<div class="form-error">${errors.courtNumber}</div>` : ''}
                        </div>
                    </div>
                ` : `
                    <div class="selected-court-display">
                        <div class="court-icon ${initialValues.courtType}">
                            <i class="fas fa-${initialValues.courtType === 'paddle' ? 'table-tennis-paddle-ball' : 'baseball'}"></i>
                        </div>
                        <div class="court-info">
                            <h4>${initialValues.courtType === 'paddle' ? 'Paddle' : 'Tennis'} Court ${initialValues.courtNumber}</h4>
                            <p>400 EGP/hour</p>
                        </div>
                    </div>
                `}
            </div>
            
            <div class="form-section">
                <h3 class="form-section-title">Date & Time</h3>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="date">Date *</label>
                        <input type="date" 
                               id="date" 
                               name="date" 
                               value="${initialValues.date}"
                               min="${getTodayDate()}"
                               max="${getMaxBookingDate()}"
                               required>
                        ${errors.date ? `<div class="form-error">${errors.date}</div>` : ''}
                    </div>
                    
                    <div class="form-group">
                        <label for="duration">Duration *</label>
                        <select id="duration" name="duration" required>
                            <option value="1" ${initialValues.duration == 1 ? 'selected' : ''}>1 hour</option>
                            <option value="1.5" ${initialValues.duration == 1.5 ? 'selected' : ''}>1.5 hours</option>
                            <option value="2" ${initialValues.duration == 2 ? 'selected' : ''}>2 hours</option>
                            <option value="2.5" ${initialValues.duration == 2.5 ? 'selected' : ''}>2.5 hours</option>
                            <option value="3" ${initialValues.duration == 3 ? 'selected' : ''}>3 hours</option>
                            <option value="3.5" ${initialValues.duration == 3.5 ? 'selected' : ''}>3.5 hours</option>
                            <option value="4" ${initialValues.duration == 4 ? 'selected' : ''}>4 hours</option>
                        </select>
                        ${errors.duration ? `<div class="form-error">${errors.duration}</div>` : ''}
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="timeSlot">Time Slot *</label>
                    <div class="time-slots-grid" id="time-slots-grid">
                        <!-- Time slots will be dynamically generated -->
                    </div>
                    <input type="hidden" id="timeSlot" name="timeSlot" value="${initialValues.timeSlot}" required>
                    ${errors.timeSlot ? `<div class="form-error">${errors.timeSlot}</div>` : ''}
                </div>
            </div>
            
            <div class="form-section">
                <h3 class="form-section-title">Price Summary</h3>
                
                <div class="price-summary">
                    <div class="price-row">
                        <span>Price per hour:</span>
                        <span>400 EGP</span>
                    </div>
                    <div class="price-row">
                        <span>Duration:</span>
                        <span id="duration-display">${initialValues.duration} hour${initialValues.duration != 1 ? 's' : ''}</span>
                    </div>
                    <div class="price-row total">
                        <span>Total:</span>
                        <span id="total-price">${initialValues.duration * 400} EGP</span>
                    </div>
                </div>
            </div>
            
            <div class="form-actions">
                ${onCancel ? `
                    <button type="button" class="btn btn-outline" id="cancel-btn">
                        Cancel
                    </button>
                ` : ''}
                
                <button type="submit" class="btn btn-primary" id="submit-btn" ${loading ? 'disabled' : ''}>
                    ${loading ? `
                        <span class="spinner"></span> Processing...
                    ` : `
                        Confirm Booking
                    `}
                </button>
            </div>
        `;
        
        return container;
    };
    
    // Initialize component
    const init = () => {
        generateCourtNumbers();
        generateTimeSlotsUI();
        setupEventListeners();
        updatePrice();
    };
    
    // Generate court numbers based on selected court type
    const generateCourtNumbers = () => {
        const courtNumberSelector = container.querySelector('#court-number-selector');
        if (!courtNumberSelector) return;
        
        const courtNumbers = initialValues.courtType === 'paddle' ? [1, 2] : [3, 4, 5];
        
        courtNumberSelector.innerHTML = courtNumbers.map(number => `
            <button type="button" class="court-number-btn ${initialValues.courtNumber == number ? 'active' : ''}" 
                    data-number="${number}">
                Court ${number}
            </button>
        `).join('');
    };
    
    // Generate time slots UI
    const generateTimeSlotsUI = () => {
        const timeSlotsGrid = container.querySelector('#time-slots-grid');
        if (!timeSlotsGrid) return;
        
        const date = container.querySelector('#date')?.value || initialValues.date;
        const duration = parseFloat(container.querySelector('#duration')?.value || initialValues.duration);
        const timeSlots = generateTimeSlots(date, duration);
        
        if (timeSlots.length === 0) {
            timeSlotsGrid.innerHTML = `
                <div class="no-slots-message">
                    <i class="fas fa-clock"></i>
                    <p>No available time slots for the selected duration.</p>
                </div>
            `;
            return;
        }
        
        timeSlotsGrid.innerHTML = timeSlots.map(slot => {
            const isSelected = slot.time === initialValues.timeSlot;
            return `
                <button type="button" class="time-slot-btn ${isSelected ? 'active' : ''}" 
                        data-time="${slot.time}">
                    <span class="time">${slot.display}</span>
                </button>
            `;
        }).join('');
    };
    
    // Setup event listeners
    const setupEventListeners = () => {
        // Court type buttons
        const paddleBtn = container.querySelector('#paddle-btn');
        const tennisBtn = container.querySelector('#tennis-btn');
        const courtTypeInput = container.querySelector('#courtType');
        
        if (paddleBtn && tennisBtn && courtTypeInput) {
            paddleBtn.addEventListener('click', () => {
                paddleBtn.classList.add('active');
                tennisBtn.classList.remove('active');
                courtTypeInput.value = 'paddle';
                updateCourtNumbers('paddle');
            });
            
            tennisBtn.addEventListener('click', () => {
                tennisBtn.classList.add('active');
                paddleBtn.classList.remove('active');
                courtTypeInput.value = 'tennis';
                updateCourtNumbers('tennis');
            });
        }
        
        // Court number buttons
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('court-number-btn')) {
                const buttons = container.querySelectorAll('.court-number-btn');
                buttons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                const courtNumberInput = container.querySelector('#courtNumber');
                if (courtNumberInput) {
                    courtNumberInput.value = e.target.dataset.number;
                }
            }
        });
        
        // Date input change
        const dateInput = container.querySelector('#date');
        if (dateInput) {
            dateInput.addEventListener('change', () => {
                generateTimeSlotsUI();
            });
        }
        
        // Duration select change
        const durationSelect = container.querySelector('#duration');
        if (durationSelect) {
            durationSelect.addEventListener('change', () => {
                updatePrice();
                generateTimeSlotsUI();
            });
        }
        
        // Time slot buttons
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('time-slot-btn')) {
                const buttons = container.querySelectorAll('.time-slot-btn');
                buttons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                const timeSlotInput = container.querySelector('#timeSlot');
                if (timeSlotInput) {
                    timeSlotInput.value = e.target.dataset.time;
                }
            }
        });
        
        // Cancel button
        const cancelBtn = container.querySelector('#cancel-btn');
        if (cancelBtn && onCancel) {
            cancelBtn.addEventListener('click', onCancel);
        }
        
        // Form submission
        container.addEventListener('submit', handleSubmit);
    };
    
    // Update court numbers when court type changes
    const updateCourtNumbers = (courtType) => {
        const courtNumberSelector = container.querySelector('#court-number-selector');
        if (!courtNumberSelector) return;
        
        const courtNumbers = courtType === 'paddle' ? [1, 2] : [3, 4, 5];
        
        courtNumberSelector.innerHTML = courtNumbers.map(number => `
            <button type="button" class="court-number-btn" data-number="${number}">
                Court ${number}
            </button>
        `).join('');
        
        // Reset court number input
        const courtNumberInput = container.querySelector('#courtNumber');
        if (courtNumberInput) {
            courtNumberInput.value = courtNumbers[0];
        }
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
    
    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formData = new FormData(container);
        const data = {
            courtType: formData.get('courtType'),
            courtNumber: parseInt(formData.get('courtNumber')),
            date: formData.get('date'),
            timeSlot: formData.get('timeSlot'),
            duration: parseFloat(formData.get('duration'))
        };
        
        // Validate required fields
        const errors = {};
        if (!data.courtType) errors.courtType = 'Court type is required';
        if (!data.courtNumber) errors.courtNumber = 'Court number is required';
        if (!data.date) errors.date = 'Date is required';
        if (!data.timeSlot) errors.timeSlot = 'Time slot is required';
        if (!data.duration) errors.duration = 'Duration is required';
        
        // If there are errors, show them and prevent submission
        if (Object.keys(errors).length > 0) {
            showErrors(errors);
            return;
        }
        
        // Clear any previous errors
        clearErrors();
        
        // Call onSubmit callback
        if (onBookingSubmit) {
            onBookingSubmit(data);
        }
    };
    
    // Show form errors
    const showErrors = (errors) => {
        clearErrors();
        
        Object.keys(errors).forEach(field => {
            const errorElement = container.querySelector(`#${field}-error`);
            if (errorElement) {
                errorElement.textContent = errors[field];
                errorElement.style.display = 'block';
            }
        });
    };
    
    // Clear form errors
    const clearErrors = () => {
        const errorElements = container.querySelectorAll('.form-error');
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
    };
    
    // Set loading state
    const setLoading = (isLoading) => {
        const submitBtn = container.querySelector('#submit-btn');
        if (submitBtn) {
            submitBtn.disabled = isLoading;
            if (isLoading) {
                submitBtn.innerHTML = '<span class="spinner"></span> Processing...';
            } else {
                submitBtn.innerHTML = 'Confirm Booking';
            }
        }
    };
    
    // Update form data
    const updateData = (newData) => {
        Object.assign(initialValues, newData);
        render();
        init();
    };
    
    // Get form data
    const getData = () => {
        const formData = new FormData(container);
        return {
            courtType: formData.get('courtType'),
            courtNumber: parseInt(formData.get('courtNumber')),
            date: formData.get('date'),
            timeSlot: formData.get('timeSlot'),
            duration: parseFloat(formData.get('duration'))
        };
    };
    
    // Reset form
    const reset = () => {
        container.reset();
        clearErrors();
        generateCourtNumbers();
        generateTimeSlotsUI();
        updatePrice();
    };
    
    return {
        render,
        init,
        setLoading,
        updateData,
        getData,
        reset,
        showErrors,
        clearErrors
    };
}