/**
 * src/api/booking.js
 * Court Reservation & Availability Service
 */

import { request } from './index.js';

export const bookingApi = {
    /**
     * Fetch available slots for a specific date and court type
     * @param {string} date - ISO format (YYYY-MM-DD)
     * @param {string} courtType - 'paddle' or 'tennis'
     */
    getAvailability: async (date, courtType) => {
        // GET /api/v1/bookings/availability?date=...&courtType=...
        return await request(`/bookings/availability?date=${date}&courtType=${courtType}`, {
            method: 'GET'
        });
    },

    /**
     * Create a new court reservation
     * @param {Object} bookingData - { courtType, courtNumber, date, timeSlot, duration }
     */
    create: async (bookingData) => {
        // POST /api/v1/bookings
        return await request('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
    },

    /**
     * Get the current logged-in user's booking history
     */
    getUserBookings: async () => {
        // GET /api/v1/bookings
        return await request('/bookings', {
            method: 'GET'
        });
    },

    /**
     * Get details of a specific booking (e.g., for payment instructions)
     * @param {string} bookingId 
     */
    getBookingDetails: async (bookingId) => {
        return await request(`/bookings/${bookingId}`, {
            method: 'GET'
        });
    }
};