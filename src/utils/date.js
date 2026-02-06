/**
 * OKZ Sports - Date and Time Utilities
 * Developed by S.R.C Laboratories
 * Date formatting, manipulation, and validation for court bookings
 */

// Operating hours constants
const OPERATING_HOURS = {
    START: 8,  // 8:00 AM
    END: 22,   // 10:00 PM
    DURATION_UNIT: 0.5 // 30 minutes increments
};

// Days of week
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} format - Format string
 * @returns {string} Formatted date
 */
export function formatDate(date, format = 'dd/mm/yyyy') {
    if (!date) return '';
    
    const d = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(d.getTime())) return 'Invalid Date';
    
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    
    switch (format.toLowerCase()) {
        case 'dd/mm/yyyy':
            return `${day}/${month}/${year}`;
        case 'mm/dd/yyyy':
            return `${month}/${day}/${year}`;
        case 'yyyy-mm-dd':
            return `${year}-${month}-${day}`;
        case 'dd-mm-yyyy':
            return `${day}-${month}-${year}`;
        case 'full':
            return `${DAYS[d.getDay()]}, ${day} ${MONTHS[d.getMonth()]} ${year}`;
        case 'short':
            return `${DAYS_SHORT[d.getDay()]}, ${day} ${MONTHS_SHORT[d.getMonth()]}`;
        case 'time':
            return `${hours}:${minutes}`;
        case 'datetime':
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        case 'iso':
            return d.toISOString();
        default:
            return d.toLocaleDateString();
    }
}

/**
 * Format time slot for display
 * @param {string} timeSlot - Time in HH:MM format
 * @returns {string} Formatted time
 */
export function formatTimeSlot(timeSlot) {
    if (!timeSlot) return '';
    
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get current date in YYYY-MM-DD format
 * @returns {string} Current date
 */
export function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

/**
 * Get tomorrow's date in YYYY-MM-DD format
 * @returns {string} Tomorrow's date
 */
export function getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
}

/**
 * Add days to a date
 * @param {Date|string} date - Starting date
 * @param {number} days - Number of days to add
 * @returns {Date} New date
 */
export function addDays(date, days) {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

/**
 * Get maximum booking date (30 days from today)
 * @returns {string} Max date in YYYY-MM-DD format
 */
export function getMaxBookingDate() {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
}

/**
 * Check if a date is within booking range (today to 30 days from now)
 * @param {string} date - Date to check in YYYY-MM-DD format
 * @returns {boolean} Is within range
 */
export function isWithinBookingRange(date) {
    if (!date) return false;
    
    const checkDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);
    
    return checkDate >= today && checkDate <= maxDate;
}

/**
 * Generate time slots for a day based on operating hours
 * @param {string} date - Date for time slots (YYYY-MM-DD)
 * @param {number} duration - Duration in hours (0.5, 1, 1.5, etc.)
 * @returns {Array} Array of time slots
 */
export function generateTimeSlots(date, duration = 1) {
    const slots = [];
    
    for (let hour = OPERATING_HOURS.START; hour < OPERATING_HOURS.END; hour += OPERATING_HOURS.DURATION_UNIT) {
        for (let minute = 0; minute < 60; minute += 30) {
            // Adjust for half hours
            const slotHour = hour + Math.floor(minute / 60);
            const slotMinute = minute % 60;
            
            // Check if slot fits within operating hours considering duration
            const endHour = slotHour + duration;
            if (endHour <= OPERATING_HOURS.END) {
                // Special case: if ending at 10 PM, must be exactly 10:00
                if (endHour === OPERATING_HOURS.END && slotMinute > 0) {
                    continue;
                }
                
                const timeSlot = `${slotHour.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}`;
                slots.push({
                    time: timeSlot,
                    display: formatTimeSlot(timeSlot),
                    hour: slotHour,
                    minute: slotMinute,
                    endTime: calculateEndTime(timeSlot, duration)
                });
            }
        }
    }
    
    return slots;
}

/**
 * Calculate end time based on start time and duration
 * @param {string} startTime - Start time in HH:MM format
 * @param {number} duration - Duration in hours
 * @returns {string} End time in HH:MM format
 */
export function calculateEndTime(startTime, duration) {
    const [hours, minutes] = startTime.split(':').map(Number);
    
    const totalMinutes = hours * 60 + minutes + (duration * 60);
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}

/**
 * Check if a time slot is in the past
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} timeSlot - Time in HH:MM format
 * @returns {boolean} Is in past
 */
export function isPastTimeSlot(date, timeSlot) {
    if (!date || !timeSlot) return false;
    
    const slotDateTime = new Date(`${date}T${timeSlot}:00`);
    const now = new Date();
    
    return slotDateTime < now;
}

/**
 * Get day of week name
 * @param {Date|string} date - Date
 * @returns {string} Day name
 */
export function getDayName(date) {
    if (!date) return '';
    
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    
    return DAYS[d.getDay()];
}

/**
 * Get short day of week name
 * @param {Date|string} date - Date
 * @returns {string} Short day name
 */
export function getShortDayName(date) {
    if (!date) return '';
    
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    
    return DAYS_SHORT[d.getDay()];
}

/**
 * Get month name
 * @param {Date|string} date - Date
 * @returns {string} Month name
 */
export function getMonthName(date) {
    if (!date) return '';
    
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    
    return MONTHS[d.getMonth()];
}

/**
 * Check if date is today
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {boolean} Is today
 */
export function isToday(date) {
    if (!date) return false;
    
    const today = new Date().toISOString().split('T')[0];
    return date === today;
}

/**
 * Check if date is tomorrow
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {boolean} Is tomorrow
 */
export function isTomorrow(date) {
    if (!date) return false;
    
    const tomorrow = getTomorrowDate();
    return date === tomorrow;
}

/**
 * Format relative time (e.g., "Tomorrow", "In 3 days")
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {string} Relative time string
 */
export function getRelativeDate(date) {
    if (!date) return '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate - today;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `In ${diffDays} days`;
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    
    return formatDate(date, 'dd/mm/yyyy');
}

/**
 * Get week number for a date
 * @param {Date|string} date - Date
 * @returns {number} Week number
 */
export function getWeekNumber(date) {
    if (!date) return 0;
    
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    
    return weekNo;
}

/**
 * Parse date string to Date object with validation
 * @param {string} dateString - Date string
 * @returns {Date|null} Date object or null if invalid
 */
export function parseDate(dateString) {
    if (!dateString) return null;
    
    // Try ISO format first
    let date = new Date(dateString);
    if (!isNaN(date.getTime())) return date;
    
    // Try YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        date = new Date(dateString + 'T00:00:00');
        if (!isNaN(date.getTime())) return date;
    }
    
    // Try DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('/');
        date = new Date(`${year}-${month}-${day}T00:00:00`);
        if (!isNaN(date.getTime())) return date;
    }
    
    return null;
}

/**
 * Get duration in hours between two times
 * @param {string} startTime - Start time in HH:MM
 * @param {string} endTime - End time in HH:MM
 * @returns {number} Duration in hours
 */
export function getDuration(startTime, endTime) {
    if (!startTime || !endTime) return 0;
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;
    
    return (endTotal - startTotal) / 60;
}

/**
 * Validate date and time combination
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:MM format
 * @returns {boolean} Is valid
 */
export function isValidDateTime(date, time) {
    if (!date || !time) return false;
    
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) return false;
    
    const dateTime = new Date(`${date}T${time}:00`);
    return !isNaN(dateTime.getTime());
}

/**
 * Get next available time slot (nearest future 30-minute increment)
 * @returns {string} Time in HH:MM format
 */
export function getNextAvailableTimeSlot() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Round up to next 30-minute increment
    let nextHour = currentHour;
    let nextMinute = currentMinute < 30 ? 30 : 0;
    
    if (currentMinute >= 30) {
        nextHour += 1;
    }
    
    // Ensure within operating hours
    if (nextHour < OPERATING_HOURS.START) {
        nextHour = OPERATING_HOURS.START;
        nextMinute = 0;
    } else if (nextHour >= OPERATING_HOURS.END) {
        // If after closing, return first slot tomorrow
        return '08:00';
    }
    
    return `${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`;
}

/**
 * Check if two time slots overlap
 * @param {string} start1 - First start time
 * @param {number} duration1 - First duration
 * @param {string} start2 - Second start time
 * @param {number} duration2 - Second duration
 * @returns {boolean} Do they overlap
 */
export function doTimeSlotsOverlap(start1, duration1, start2, duration2) {
    const [h1, m1] = start1.split(':').map(Number);
    const [h2, m2] = start2.split(':').map(Number);
    
    const startMinutes1 = h1 * 60 + m1;
    const endMinutes1 = startMinutes1 + (duration1 * 60);
    const startMinutes2 = h2 * 60 + m2;
    const endMinutes2 = startMinutes2 + (duration2 * 60);
    
    return startMinutes1 < endMinutes2 && endMinutes1 > startMinutes2;
}

/**
 * Format booking duration for display
 * @param {number} duration - Duration in hours
 * @returns {string} Formatted duration
 */
export function formatDuration(duration) {
    if (!duration || duration <= 0) return '0 hours';
    
    const hours = Math.floor(duration);
    const minutes = (duration - hours) * 60;
    
    if (hours === 0 && minutes === 30) return '30 minutes';
    if (hours === 0) return `${minutes} minutes`;
    if (minutes === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
    
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minutes`;
}

// Export constants
export { OPERATING_HOURS, DAYS, DAYS_SHORT, MONTHS, MONTHS_SHORT };

// Default export
export default {
    formatDate,
    formatTimeSlot,
    getTodayDate,
    getTomorrowDate,
    addDays,
    getMaxBookingDate,
    isWithinBookingRange,
    generateTimeSlots,
    calculateEndTime,
    isPastTimeSlot,
    getDayName,
    getShortDayName,
    getMonthName,
    isToday,
    isTomorrow,
    getRelativeDate,
    getWeekNumber,
    parseDate,
    getDuration,
    isValidDateTime,
    getNextAvailableTimeSlot,
    doTimeSlotsOverlap,
    formatDuration,
    OPERATING_HOURS,
    DAYS,
    DAYS_SHORT,
    MONTHS,
    MONTHS_SHORT
};