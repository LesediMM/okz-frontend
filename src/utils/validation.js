/**
 * OKZ Sports - Validation Utilities
 * Developed by S.R.C Laboratories
 * Comprehensive validation functions for forms and inputs
 */

// Validation patterns and constants
const PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[0-9\-\+]{9,15}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, // At least one lowercase, one uppercase, one number
    TIME_SLOT: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format (24-hour)
    DATE: /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD format
    NUMERIC: /^\d+$/,
    DECIMAL: /^\d+(\.\d{1,2})?$/
};

const CONSTRAINTS = {
    PASSWORD_MIN_LENGTH: 6,
    PASSWORD_MAX_LENGTH: 100,
    FULLNAME_MIN_LENGTH: 2,
    FULLNAME_MAX_LENGTH: 50,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 30,
    PHONE_MIN_LENGTH: 9,
    PHONE_MAX_LENGTH: 15,
    BOOKING_DURATION_MIN: 1,
    BOOKING_DURATION_MAX: 4,
    COURT_NUMBER_MIN: 1,
    COURT_NUMBER_MAX: 5,
    NOTES_MAX_LENGTH: 500
};

// Validation error messages
const ERROR_MESSAGES = {
    REQUIRED: (field) => `${field} is required`,
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PHONE: 'Please enter a valid phone number',
    PASSWORD_TOO_SHORT: `Password must be at least ${CONSTRAINTS.PASSWORD_MIN_LENGTH} characters`,
    PASSWORD_TOO_LONG: `Password cannot exceed ${CONSTRAINTS.PASSWORD_MAX_LENGTH} characters`,
    PASSWORD_REQUIREMENTS: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    FULLNAME_TOO_SHORT: `Full name must be at least ${CONSTRAINTS.FULLNAME_MIN_LENGTH} characters`,
    FULLNAME_TOO_LONG: `Full name cannot exceed ${CONSTRAINTS.FULLNAME_MAX_LENGTH} characters`,
    USERNAME_TOO_SHORT: `Username must be at least ${CONSTRAINTS.USERNAME_MIN_LENGTH} characters`,
    USERNAME_TOO_LONG: `Username cannot exceed ${CONSTRAINTS.USERNAME_MAX_LENGTH} characters`,
    INVALID_DATE: 'Please enter a valid date in YYYY-MM-DD format',
    INVALID_TIME: 'Please enter a valid time in HH:MM format (24-hour)',
    PAST_DATE: 'Cannot select a date in the past',
    FUTURE_DATE_LIMIT: (days) => `Cannot book more than ${days} days in advance`,
    INVALID_COURT_NUMBER: `Court number must be between ${CONSTRAINTS.COURT_NUMBER_MIN} and ${CONSTRAINTS.COURT_NUMBER_MAX}`,
    INVALID_DURATION: `Duration must be between ${CONSTRAINTS.BOOKING_DURATION_MIN} and ${CONSTRAINTS.BOOKING_DURATION_MAX} hours`,
    NOTES_TOO_LONG: `Notes cannot exceed ${CONSTRAINTS.NOTES_MAX_LENGTH} characters`,
    NOT_NUMERIC: 'Please enter a valid number',
    NOT_DECIMAL: 'Please enter a valid decimal number',
    MIN_VALUE: (min) => `Value must be at least ${min}`,
    MAX_VALUE: (max) => `Value cannot exceed ${max}`,
    INVALID_COURT_TYPE: 'Court type must be either "paddle" or "tennis"',
    COURT_MISMATCH: (courtType, min, max) => `${courtType.charAt(0).toUpperCase() + courtType.slice(1)} courts are numbered ${min}-${max}`,
    INVALID_TIME_SLOT: 'Time must be on the hour or half hour (00 or 30 minutes)',
    OUTSIDE_OPERATING_HOURS: (start, end) => `Court operates from ${start}:00 to ${end}:00`
};

/**
 * Main validation function
 * @param {Object} data - Data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export function validate(data, rules) {
    const errors = {};
    
    Object.keys(rules).forEach(field => {
        const value = data[field];
        const fieldRules = rules[field];
        
        // Skip validation if field is optional and empty
        if (fieldRules.optional && (value === undefined || value === null || value === '')) {
            return;
        }
        
        // Required check
        if (fieldRules.required && (value === undefined || value === null || value === '')) {
            errors[field] = ERROR_MESSAGES.REQUIRED(fieldRules.label || field);
            return;
        }
        
        // Type-specific validations
        if (value !== undefined && value !== null && value !== '') {
            const trimmedValue = typeof value === 'string' ? value.trim() : value;
            
            // Email validation
            if (fieldRules.email && !PATTERNS.EMAIL.test(trimmedValue)) {
                errors[field] = ERROR_MESSAGES.INVALID_EMAIL;
                return;
            }
            
            // Phone validation
            if (fieldRules.phone && !PATTERNS.PHONE.test(trimmedValue)) {
                errors[field] = ERROR_MESSAGES.INVALID_PHONE;
                return;
            }
            
            // Password validation
            if (fieldRules.password) {
                if (trimmedValue.length < CONSTRAINTS.PASSWORD_MIN_LENGTH) {
                    errors[field] = ERROR_MESSAGES.PASSWORD_TOO_SHORT;
                    return;
                }
                if (trimmedValue.length > CONSTRAINTS.PASSWORD_MAX_LENGTH) {
                    errors[field] = ERROR_MESSAGES.PASSWORD_TOO_LONG;
                    return;
                }
                if (!PATTERNS.PASSWORD.test(trimmedValue)) {
                    errors[field] = ERROR_MESSAGES.PASSWORD_REQUIREMENTS;
                    return;
                }
            }
            
            // String length validations
            if (fieldRules.minLength && trimmedValue.length < fieldRules.minLength) {
                errors[field] = fieldRules.minLengthMessage || `${fieldRules.label || field} must be at least ${fieldRules.minLength} characters`;
                return;
            }
            
            if (fieldRules.maxLength && trimmedValue.length > fieldRules.maxLength) {
                errors[field] = fieldRules.maxLengthMessage || `${fieldRules.label || field} cannot exceed ${fieldRules.maxLength} characters`;
                return;
            }
            
            // Numeric validations
            if (fieldRules.numeric && !PATTERNS.NUMERIC.test(trimmedValue.toString())) {
                errors[field] = ERROR_MESSAGES.NOT_NUMERIC;
                return;
            }
            
            if (fieldRules.decimal && !PATTERNS.DECIMAL.test(trimmedValue.toString())) {
                errors[field] = ERROR_MESSAGES.NOT_DECIMAL;
                return;
            }
            
            // Range validations
            if (fieldRules.min !== undefined) {
                const numValue = parseFloat(trimmedValue);
                if (numValue < fieldRules.min) {
                    errors[field] = fieldRules.minMessage || ERROR_MESSAGES.MIN_VALUE(fieldRules.min);
                    return;
                }
            }
            
            if (fieldRules.max !== undefined) {
                const numValue = parseFloat(trimmedValue);
                if (numValue > fieldRules.max) {
                    errors[field] = fieldRules.maxMessage || ERROR_MESSAGES.MAX_VALUE(fieldRules.max);
                    return;
                }
            }
            
            // Date validation
            if (fieldRules.date) {
                if (!PATTERNS.DATE.test(trimmedValue)) {
                    errors[field] = ERROR_MESSAGES.INVALID_DATE;
                    return;
                }
                
                const date = new Date(trimmedValue);
                if (isNaN(date.getTime())) {
                    errors[field] = ERROR_MESSAGES.INVALID_DATE;
                    return;
                }
                
                // Check if date is in the past
                if (fieldRules.notPast) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (date < today) {
                        errors[field] = ERROR_MESSAGES.PAST_DATE;
                        return;
                    }
                }
                
                // Check if date is within future limit
                if (fieldRules.maxFutureDays) {
                    const maxDate = new Date();
                    maxDate.setDate(maxDate.getDate() + fieldRules.maxFutureDays);
                    if (date > maxDate) {
                        errors[field] = ERROR_MESSAGES.FUTURE_DATE_LIMIT(fieldRules.maxFutureDays);
                        return;
                    }
                }
            }
            
            // Time validation
            if (fieldRules.time) {
                if (!PATTERNS.TIME_SLOT.test(trimmedValue)) {
                    errors[field] = ERROR_MESSAGES.INVALID_TIME;
                    return;
                }
                
                // Check if time is on hour or half hour
                if (fieldRules.onHourOrHalf) {
                    const minutes = trimmedValue.split(':')[1];
                    if (minutes !== '00' && minutes !== '30') {
                        errors[field] = ERROR_MESSAGES.INVALID_TIME_SLOT;
                        return;
                    }
                }
                
                // Check operating hours
                if (fieldRules.operatingHours) {
                    const hours = parseInt(trimmedValue.split(':')[0]);
                    const [start, end] = fieldRules.operatingHours;
                    if (hours < start || hours >= end) {
                        errors[field] = ERROR_MESSAGES.OUTSIDE_OPERATING_HOURS(start, end);
                        return;
                    }
                }
            }
            
            // Custom validation function
            if (fieldRules.validate && typeof fieldRules.validate === 'function') {
                const customResult = fieldRules.validate(trimmedValue, data);
                if (customResult !== true) {
                    errors[field] = customResult;
                    return;
                }
            }
            
            // Array validation
            if (fieldRules.inArray && !fieldRules.inArray.includes(trimmedValue)) {
                errors[field] = `${fieldRules.label || field} must be one of: ${fieldRules.inArray.join(', ')}`;
                return;
            }
        }
    });
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Validate user registration form data
 * @param {Object} data - Registration form data
 * @returns {Object} - Validation result
 */
export function validateRegistration(data) {
    const rules = {
        email: {
            required: true,
            email: true,
            label: 'Email'
        },
        password: {
            required: true,
            password: true,
            label: 'Password'
        },
        confirmPassword: {
            required: true,
            label: 'Confirm Password',
            validate: (value, allData) => {
                if (value !== allData.password) {
                    return 'Passwords do not match';
                }
                return true;
            }
        },
        fullName: {
            optional: true,
            minLength: CONSTRAINTS.FULLNAME_MIN_LENGTH,
            maxLength: CONSTRAINTS.FULLNAME_MAX_LENGTH,
            minLengthMessage: ERROR_MESSAGES.FULLNAME_TOO_SHORT,
            maxLengthMessage: ERROR_MESSAGES.FULLNAME_TOO_LONG,
            label: 'Full Name'
        },
        phoneNumber: {
            optional: true,
            phone: true,
            label: 'Phone Number'
        }
    };
    
    return validate(data, rules);
}

/**
 * Validate user login form data
 * @param {Object} data - Login form data
 * @returns {Object} - Validation result
 */
export function validateLogin(data) {
    const rules = {
        email: {
            required: true,
            email: true,
            label: 'Email'
        },
        password: {
            required: true,
            label: 'Password'
        }
    };
    
    return validate(data, rules);
}

/**
 * Validate admin login form data
 * @param {Object} data - Admin login form data
 * @returns {Object} - Validation result
 */
export function validateAdminLogin(data) {
    const rules = {
        username: {
            required: true,
            label: 'Username'
        },
        password: {
            required: true,
            minLength: CONSTRAINTS.PASSWORD_MIN_LENGTH,
            minLengthMessage: ERROR_MESSAGES.PASSWORD_TOO_SHORT,
            label: 'Password'
        }
    };
    
    return validate(data, rules);
}

/**
 * Validate booking form data
 * @param {Object} data - Booking form data
 * @returns {Object} - Validation result
 */
export function validateBooking(data) {
    const rules = {
        courtType: {
            required: true,
            inArray: ['paddle', 'tennis'],
            label: 'Court Type'
        },
        courtNumber: {
            required: true,
            numeric: true,
            min: CONSTRAINTS.COURT_NUMBER_MIN,
            max: CONSTRAINTS.COURT_NUMBER_MAX,
            minMessage: ERROR_MESSAGES.INVALID_COURT_NUMBER,
            maxMessage: ERROR_MESSAGES.INVALID_COURT_NUMBER,
            label: 'Court Number',
            validate: (value, allData) => {
                const courtNum = parseInt(value);
                const courtType = allData.courtType;
                
                if (courtType === 'paddle' && (courtNum < 1 || courtNum > 2)) {
                    return ERROR_MESSAGES.COURT_MISMATCH('paddle', 1, 2);
                }
                
                if (courtType === 'tennis' && (courtNum < 3 || courtNum > 5)) {
                    return ERROR_MESSAGES.COURT_MISMATCH('tennis', 3, 5);
                }
                
                return true;
            }
        },
        date: {
            required: true,
            date: true,
            notPast: true,
            maxFutureDays: 30,
            label: 'Date'
        },
        timeSlot: {
            required: true,
            time: true,
            onHourOrHalf: true,
            operatingHours: [8, 22], // 8 AM to 10 PM
            label: 'Time'
        },
        duration: {
            required: true,
            numeric: true,
            min: CONSTRAINTS.BOOKING_DURATION_MIN,
            max: CONSTRAINTS.BOOKING_DURATION_MAX,
            minMessage: ERROR_MESSAGES.INVALID_DURATION,
            maxMessage: ERROR_MESSAGES.INVALID_DURATION,
            label: 'Duration'
        }
    };
    
    return validate(data, rules);
}

/**
 * Validate user profile form data
 * @param {Object} data - Profile form data
 * @returns {Object} - Validation result
 */
export function validateProfile(data) {
    const rules = {
        fullName: {
            optional: true,
            minLength: CONSTRAINTS.FULLNAME_MIN_LENGTH,
            maxLength: CONSTRAINTS.FULLNAME_MAX_LENGTH,
            minLengthMessage: ERROR_MESSAGES.FULLNAME_TOO_SHORT,
            maxLengthMessage: ERROR_MESSAGES.FULLNAME_TOO_LONG,
            label: 'Full Name'
        },
        phoneNumber: {
            optional: true,
            phone: true,
            label: 'Phone Number'
        }
    };
    
    return validate(data, rules);
}

/**
 * Validate admin booking status update
 * @param {Object} data - Status update data
 * @returns {Object} - Validation result
 */
export function validateBookingStatus(data) {
    const rules = {
        status: {
            required: true,
            inArray: ['active', 'cancelled', 'completed'],
            label: 'Status'
        },
        notes: {
            optional: true,
            maxLength: CONSTRAINTS.NOTES_MAX_LENGTH,
            maxLengthMessage: ERROR_MESSAGES.NOTES_TOO_LONG,
            label: 'Notes'
        }
    };
    
    return validate(data, rules);
}

/**
 * Sanitize input values
 * @param {string|any} value - Value to sanitize
 * @returns {string|any} - Sanitized value
 */
export function sanitize(value) {
    if (typeof value === 'string') {
        // Trim whitespace
        let sanitized = value.trim();
        
        // Remove excessive whitespace
        sanitized = sanitized.replace(/\s+/g, ' ');
        
        // Convert to lowercase for emails
        if (PATTERNS.EMAIL.test(sanitized)) {
            sanitized = sanitized.toLowerCase();
        }
        
        return sanitized;
    }
    
    return value;
}

/**
 * Sanitize form data object
 * @param {Object} data - Data object to sanitize
 * @returns {Object} - Sanitized data
 */
export function sanitizeFormData(data) {
    const sanitized = {};
    
    Object.keys(data).forEach(key => {
        sanitized[key] = sanitize(data[key]);
    });
    
    return sanitized;
}

/**
 * Format validation errors for display
 * @param {Object} errors - Validation errors object
 * @returns {Array} - Array of error messages
 */
export function formatErrors(errors) {
    return Object.keys(errors).map(field => ({
        field,
        message: errors[field]
    }));
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Is valid email
 */
export function isValidEmail(email) {
    return PATTERNS.EMAIL.test(email);
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - Is valid phone number
 */
export function isValidPhone(phone) {
    return PATTERNS.PHONE.test(phone);
}

/**
 * Validate date format
 * @param {string} date - Date to validate (YYYY-MM-DD)
 * @returns {boolean} - Is valid date
 */
export function isValidDate(date) {
    if (!PATTERNS.DATE.test(date)) return false;
    
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
}

/**
 * Validate time format
 * @param {string} time - Time to validate (HH:MM)
 * @returns {boolean} - Is valid time
 */
export function isValidTime(time) {
    return PATTERNS.TIME_SLOT.test(time);
}

/**
 * Check if date is in the future
 * @param {string} date - Date to check (YYYY-MM-DD)
 * @returns {boolean} - Is future date
 */
export function isFutureDate(date) {
    if (!isValidDate(date)) return false;
    
    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return inputDate >= today;
}

/**
 * Check if date is within specified days in the future
 * @param {string} date - Date to check
 * @param {number} maxDays - Maximum days in the future
 * @returns {boolean} - Is within allowed range
 */
export function isWithinFutureDays(date, maxDays) {
    if (!isValidDate(date)) return false;
    
    const inputDate = new Date(date);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + maxDays);
    
    return inputDate <= maxDate;
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with score and feedback
 */
export function validatePasswordStrength(password) {
    const result = {
        isValid: false,
        score: 0,
        feedback: []
    };
    
    if (!password) return result;
    
    // Length check
    if (password.length >= CONSTRAINTS.PASSWORD_MIN_LENGTH) {
        result.score += 1;
    } else {
        result.feedback.push(ERROR_MESSAGES.PASSWORD_TOO_SHORT);
    }
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) {
        result.score += 1;
    } else {
        result.feedback.push('Add uppercase letters');
    }
    
    // Contains lowercase
    if (/[a-z]/.test(password)) {
        result.score += 1;
    } else {
        result.feedback.push('Add lowercase letters');
    }
    
    // Contains numbers
    if (/\d/.test(password)) {
        result.score += 1;
    } else {
        result.feedback.push('Add numbers');
    }
    
    // Contains special characters (optional bonus)
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        result.score += 0.5;
    }
    
    // Minimum requirements met
    result.isValid = result.score >= 3;
    
    if (result.isValid && result.feedback.length === 0) {
        result.feedback.push('Password strength: Good');
    }
    
    return result;
}

/**
 * Real-time input validation with visual feedback
 * @param {HTMLInputElement} input - Input element to validate
 * @param {Object} rule - Validation rule
 * @returns {Object} - Validation result
 */
export function validateInput(input, rule) {
    const value = input.value;
    const name = input.name || input.id;
    const result = {
        isValid: true,
        message: ''
    };
    
    // Required check
    if (rule.required && !value.trim()) {
        result.isValid = false;
        result.message = ERROR_MESSAGES.REQUIRED(rule.label || name);
        return result;
    }
    
    if (value.trim()) {
        // Email validation
        if (rule.email && !PATTERNS.EMAIL.test(value)) {
            result.isValid = false;
            result.message = ERROR_MESSAGES.INVALID_EMAIL;
            return result;
        }
        
        // Length checks
        if (rule.minLength && value.length < rule.minLength) {
            result.isValid = false;
            result.message = rule.minLengthMessage || `${rule.label || name} must be at least ${rule.minLength} characters`;
            return result;
        }
        
        if (rule.maxLength && value.length > rule.maxLength) {
            result.isValid = false;
            result.message = rule.maxLengthMessage || `${rule.label || name} cannot exceed ${rule.maxLength} characters`;
            return result;
        }
    }
    
    return result;
}

/**
 * Add real-time validation to form inputs
 * @param {HTMLFormElement} form - Form element
 * @param {Object} validationRules - Validation rules for form inputs
 */
export function setupRealTimeValidation(form, validationRules) {
    Object.keys(validationRules).forEach(fieldName => {
        const input = form.querySelector(`[name="${fieldName}"]`);
        if (!input) return;
        
        const rule = validationRules[fieldName];
        
        // Validate on input change
        input.addEventListener('blur', () => {
            const result = validateInput(input, rule);
            updateInputValidationState(input, result);
        });
        
        // Clear error on input
        input.addEventListener('input', () => {
            if (input.classList.contains('error')) {
                clearInputValidationState(input);
            }
        });
    });
}

/**
 * Update input visual state based on validation result
 * @param {HTMLInputElement} input - Input element
 * @param {Object} validationResult - Validation result
 */
export function updateInputValidationState(input, validationResult) {
    const parent = input.parentElement;
    const errorElement = parent.querySelector('.error-message');
    
    if (errorElement) {
        errorElement.remove();
    }
    
    if (!validationResult.isValid) {
        input.classList.add('error');
        input.classList.remove('valid');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = validationResult.message;
        errorDiv.style.color = '#ef4444';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '4px';
        
        parent.appendChild(errorDiv);
    } else if (input.value.trim()) {
        input.classList.remove('error');
        input.classList.add('valid');
    } else {
        input.classList.remove('error', 'valid');
    }
}

/**
 * Clear input validation state
 * @param {HTMLInputElement} input - Input element
 */
export function clearInputValidationState(input) {
    input.classList.remove('error', 'valid');
    
    const parent = input.parentElement;
    const errorElement = parent.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

/**
 * Validate court availability constraints
 * @param {Object} bookingData - Booking data
 * @returns {Object} - Validation result
 */
export function validateCourtAvailability(bookingData) {
    const errors = [];
    
    // Check operating hours (8 AM to 10 PM)
    const [hours, minutes] = bookingData.timeSlot.split(':').map(Number);
    const startHour = hours;
    const endHour = hours + bookingData.duration;
    
    if (startHour < 8 || endHour > 22) {
        errors.push(ERROR_MESSAGES.OUTSIDE_OPERATING_HOURS(8, 22));
    }
    
    // Check that end time is within operating hours
    if (endHour === 22 && minutes > 0) {
        errors.push('Booking must end by 10:00 PM');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// Export constants for external use
export { PATTERNS, CONSTRAINTS, ERROR_MESSAGES };

// Default export
export default {
    validate,
    validateRegistration,
    validateLogin,
    validateAdminLogin,
    validateBooking,
    validateProfile,
    validateBookingStatus,
    sanitize,
    sanitizeFormData,
    formatErrors,
    isValidEmail,
    isValidPhone,
    isValidDate,
    isValidTime,
    isFutureDate,
    isWithinFutureDays,
    validatePasswordStrength,
    validateInput,
    setupRealTimeValidation,
    updateInputValidationState,
    clearInputValidationState,
    validateCourtAvailability,
    PATTERNS,
    CONSTRAINTS,
    ERROR_MESSAGES
};