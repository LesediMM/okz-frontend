/**
 * OKZ Sports - Booking API
 * Developed by S.R.C Laboratories
 * Booking-related API calls
 */

import { api } from './index.js';

// Booking API methods
export const bookingApi = {
    // Create a new booking
    async createBooking(bookingData) {
        try {
            const response = await api.post('/bookings', bookingData);
            return response;
        } catch (error) {
            console.error('Create booking error:', error);
            throw error;
        }
    },
    
    // Get user's bookings
    async getUserBookings(status = 'active', page = 1, limit = 10) {
        try {
            const params = { page, limit };
            if (status !== 'all') {
                params.status = status;
            }
            
            const response = await api.get('/bookings', params);
            return response;
        } catch (error) {
            console.error('Get user bookings error:', error);
            throw error;
        }
    },
    
    // Get specific booking by ID
    async getBooking(bookingId) {
        try {
            const response = await api.get(`/bookings/${bookingId}`);
            return response;
        } catch (error) {
            console.error('Get booking error:', error);
            throw error;
        }
    },
    
    // Cancel a booking
    async cancelBooking(bookingId) {
        try {
            const response = await api.delete(`/bookings/${bookingId}`);
            return response;
        } catch (error) {
            console.error('Cancel booking error:', error);
            throw error;
        }
    },
    
    // Check court availability
    async checkAvailability(date, courtType = null) {
        try {
            const params = { date };
            if (courtType) {
                params.courtType = courtType;
            }
            
            const response = await api.get('/bookings/availability', params);
            return response;
        } catch (error) {
            console.error('Check availability error:', error);
            throw error;
        }
    },
    
    // Get booking availability matrix
    async getAvailabilityMatrix(date, courtType = null) {
        try {
            // This could be an enhanced version of checkAvailability
            // For now, we'll use the same endpoint
            return await this.checkAvailability(date, courtType);
        } catch (error) {
            console.error('Get availability matrix error:', error);
            throw error;
        }
    },
    
    // Get active bookings (admin only)
    async getActiveBookings(filters = {}) {
        try {
            const response = await api.get('/admin/bookings/active', filters);
            return response;
        } catch (error) {
            console.error('Get active bookings error:', error);
            throw error;
        }
    },
    
    // Get booking history (admin only)
    async getBookingHistory(filters = {}) {
        try {
            const response = await api.get('/admin/bookings/history', filters);
            return response;
        } catch (error) {
            console.error('Get booking history error:', error);
            throw error;
        }
    },
    
    // Update booking status (admin only)
    async updateBookingStatus(bookingId, status, notes = '') {
        try {
            const response = await api.put(`/admin/bookings/${bookingId}/status`, {
                status,
                notes
            });
            return response;
        } catch (error) {
            console.error('Update booking status error:', error);
            throw error;
        }
    },
    
    // Get dashboard data (admin only)
    async getDashboardData() {
        try {
            const response = await api.get('/admin/dashboard');
            return response;
        } catch (error) {
            console.error('Get dashboard data error:', error);
            throw error;
        }
    },
    
    // Get revenue report (admin only)
    async getRevenueReport(period = 'monthly', startDate = null, endDate = null) {
        try {
            const params = { period };
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            
            const response = await api.get('/admin/revenue', params);
            return response;
        } catch (error) {
            console.error('Get revenue report error:', error);
            throw error;
        }
    },
    
    // Get users list (admin only)
    async getUsers(filters = {}) {
        try {
            const response = await api.get('/admin/users', filters);
            return response;
        } catch (error) {
            console.error('Get users error:', error);
            throw error;
        }
    },
    
    // Get court statistics
    async getCourtStats(date = null) {
        try {
            const params = {};
            if (date) params.date = date;
            
            // This endpoint might need to be implemented in the backend
            // For now, we'll use availability data
            const availability = await this.checkAvailability(date || new Date().toISOString().split('T')[0]);
            
            // Calculate basic statistics from availability data
            const stats = {
                date: date || new Date().toISOString().split('T')[0],
                totalCourts: 5,
                paddleCourts: 2,
                tennisCourts: 3,
                bookings: 0,
                availability: availability.data?.availability || {}
            };
            
            return {
                status: 'success',
                data: { stats }
            };
        } catch (error) {
            console.error('Get court stats error:', error);
            throw error;
        }
    },
    
    // Get upcoming bookings for a specific court
    async getCourtBookings(courtNumber, date = null) {
        try {
            // This would require a specific backend endpoint
            // For now, we'll filter from active bookings
            const activeBookings = await this.getActiveBookings();
            
            if (activeBookings.data?.bookings) {
                const courtBookings = activeBookings.data.bookings.filter(
                    booking => booking.courtNumber === courtNumber
                );
                
                return {
                    status: 'success',
                    data: {
                        courtNumber,
                        bookings: courtBookings,
                        date: date || 'all'
                    }
                };
            }
            
            return {
                status: 'success',
                data: {
                    courtNumber,
                    bookings: [],
                    date: date || 'all'
                }
            };
        } catch (error) {
            console.error('Get court bookings error:', error);
            throw error;
        }
    },
    
    // Get booking statistics for user
    async getUserBookingStats(userId = null) {
        try {
            // If no userId provided, use current user's bookings
            const userBookings = await this.getUserBookings('all', 1, 100);
            
            if (userBookings.data?.bookings) {
                const bookings = userBookings.data.bookings;
                const now = new Date();
                
                const stats = {
                    total: bookings.length,
                    active: bookings.filter(b => b.status === 'active').length,
                    upcoming: bookings.filter(b => 
                        b.status === 'active' && new Date(b.date) > now
                    ).length,
                    past: bookings.filter(b => 
                        b.status === 'completed' || 
                        (b.status === 'active' && new Date(b.date) < now)
                    ).length,
                    cancelled: bookings.filter(b => b.status === 'cancelled').length,
                    totalSpent: bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0)
                };
                
                return {
                    status: 'success',
                    data: { stats }
                };
            }
            
            return {
                status: 'success',
                data: {
                    stats: {
                        total: 0,
                        active: 0,
                        upcoming: 0,
                        past: 0,
                        cancelled: 0,
                        totalSpent: 0
                    }
                }
            };
        } catch (error) {
            console.error('Get user booking stats error:', error);
            throw error;
        }
    },
    
    // Check if user can book (rate limiting, daily limits, etc.)
    async checkBookingEligibility() {
        try {
            // Get user's bookings for today
            const today = new Date().toISOString().split('T')[0];
            const userBookings = await this.getUserBookings('active', 1, 100);
            
            if (userBookings.data?.bookings) {
                const todayBookings = userBookings.data.bookings.filter(booking => 
                    booking.date.startsWith(today)
                );
                
                const isAdmin = localStorage.getItem('okz_admin_token');
                const maxDailyBookings = isAdmin ? 3 : 1;
                
                return {
                    status: 'success',
                    data: {
                        eligible: todayBookings.length < maxDailyBookings,
                        todayBookings: todayBookings.length,
                        maxDailyBookings,
                        message: todayBookings.length >= maxDailyBookings 
                            ? `You have reached the maximum of ${maxDailyBookings} booking(s) per day`
                            : 'You can book a court'
                    }
                };
            }
            
            return {
                status: 'success',
                data: {
                    eligible: true,
                    todayBookings: 0,
                    maxDailyBookings: 1,
                    message: 'You can book a court'
                }
            };
        } catch (error) {
            console.error('Check booking eligibility error:', error);
            throw error;
        }
    },
    
    // Get operating hours
    async getOperatingHours() {
        try {
            // This could come from an API endpoint or be hardcoded
            return {
                status: 'success',
                data: {
                    operatingHours: {
                        start: 8,
                        end: 22,
                        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                        formatted: '8:00 AM - 10:00 PM'
                    }
                }
            };
        } catch (error) {
            console.error('Get operating hours error:', error);
            throw error;
        }
    },
    
    // Get pricing information
    async getPricing() {
        try {
            // This could come from an API endpoint or be hardcoded
            return {
                status: 'success',
                data: {
                    pricePerHour: 400,
                    currency: 'EGP',
                    discounts: [
                        { type: 'membership', discount: 10, description: 'Members get 10% off' },
                        { type: 'group', discount: 15, description: 'Group bookings (4+ hours) get 15% off' }
                    ]
                }
            };
        } catch (error) {
            console.error('Get pricing error:', error);
            throw error;
        }
    },
    
    // Send booking reminder (admin only)
    async sendBookingReminder(bookingId) {
        try {
            // Note: This endpoint needs to be implemented in the backend
            const response = await api.post(`/admin/bookings/${bookingId}/reminder`);
            return response;
        } catch (error) {
            console.error('Send booking reminder error:', error);
            throw error;
        }
    },
    
    // Export bookings to CSV (admin only)
    async exportBookings(format = 'csv', filters = {}) {
        try {
            // Note: This endpoint needs to be implemented in the backend
            const response = await api.get('/admin/bookings/export', { format, ...filters });
            return response;
        } catch (error) {
            console.error('Export bookings error:', error);
            throw error;
        }
    }
};

// Export booking API
export default bookingApi;