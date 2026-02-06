/**
 * OKZ Sports - User Dashboard Page
 * Developed by S.R.C Laboratories
 * User dashboard with booking overview and quick actions
 */

import { formatDate } from '../utils/date.js';
import { showNotification } from '../utils/notification.js';

export default function UserDashboard({ store, router, onNavigate, onShowNotification }) {
    const container = document.createElement('div');
    container.className = 'user-dashboard-page';
    
    let user = null;
    let bookings = [];
    let isLoading = false;
    
    // Render function
    const render = () => {
        user = store.auth.getUser();
        
        if (!user) {
            onNavigate('/login');
            return container;
        }
        
        container.innerHTML = `
            <div class="dashboard-container">
                <!-- Header -->
                <div class="dashboard-header">
                    <h1>Dashboard</h1>
                    <p>Welcome back, ${user.fullName || user.email}</p>
                </div>
                
                <!-- Quick Stats -->
                <div class="quick-stats" id="quick-stats">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="active-bookings-count">0</h3>
                            <p>Active Bookings</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="upcoming-bookings-count">0</h3>
                            <p>Upcoming</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-history"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="total-bookings-count">0</h3>
                            <p>Total Bookings</p>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="quick-actions">
                    <h2>Quick Actions</h2>
                    <div class="action-buttons">
                        <button class="btn btn-primary" id="book-court-btn">
                            <i class="fas fa-plus"></i> Book a Court
                        </button>
                        <button class="btn btn-outline" id="view-bookings-btn">
                            <i class="fas fa-list"></i> View My Bookings
                        </button>
                        <button class="btn btn-outline" id="check-availability-btn">
                            <i class="fas fa-search"></i> Check Availability
                        </button>
                    </div>
                </div>
                
                <!-- Recent Bookings -->
                <div class="recent-bookings">
                    <div class="section-header">
                        <h2>Recent Bookings</h2>
                        <a href="/my-bookings" id="view-all-bookings">View All</a>
                    </div>
                    
                    <div class="bookings-list" id="recent-bookings-list">
                        <div class="loading-placeholder">
                            <div class="spinner"></div>
                            <p>Loading bookings...</p>
                        </div>
                    </div>
                </div>
                
                <!-- Upcoming Bookings -->
                <div class="upcoming-bookings">
                    <div class="section-header">
                        <h2>Upcoming Bookings</h2>
                        <span class="badge" id="upcoming-count">0 upcoming</span>
                    </div>
                    
                    <div class="bookings-list" id="upcoming-bookings-list">
                        <div class="loading-placeholder">
                            <div class="spinner"></div>
                            <p>Loading upcoming bookings...</p>
                        </div>
                    </div>
                </div>
                
                <!-- User Info -->
                <div class="user-info-card">
                    <div class="user-info-header">
                        <div class="user-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="user-details">
                            <h3>${user.fullName || 'User'}</h3>
                            <p>${user.email}</p>
                            ${user.phoneNumber ? `<p><i class="fas fa-phone"></i> ${user.phoneNumber}</p>` : ''}
                        </div>
                    </div>
                    <div class="user-info-actions">
                        <button class="btn btn-outline btn-sm" id="edit-profile-btn">
                            <i class="fas fa-edit"></i> Edit Profile
                        </button>
                        <button class="btn btn-outline btn-sm" id="logout-btn">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
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
        
        user = store.auth.getUser();
        setupEventListeners();
        await loadDashboardData();
    };
    
    // Setup event listeners
    const setupEventListeners = () => {
        // Book court button
        const bookCourtBtn = container.querySelector('#book-court-btn');
        if (bookCourtBtn) {
            bookCourtBtn.addEventListener('click', () => {
                onNavigate('/booking');
            });
        }
        
        // View bookings button
        const viewBookingsBtn = container.querySelector('#view-bookings-btn');
        if (viewBookingsBtn) {
            viewBookingsBtn.addEventListener('click', () => {
                onNavigate('/my-bookings');
            });
        }
        
        // Check availability button
        const checkAvailabilityBtn = container.querySelector('#check-availability-btn');
        if (checkAvailabilityBtn) {
            checkAvailabilityBtn.addEventListener('click', () => {
                onNavigate('/booking');
            });
        }
        
        // View all bookings link
        const viewAllBookings = container.querySelector('#view-all-bookings');
        if (viewAllBookings) {
            viewAllBookings.addEventListener('click', (e) => {
                e.preventDefault();
                onNavigate('/my-bookings');
            });
        }
        
        // Edit profile button
        const editProfileBtn = container.querySelector('#edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                showEditProfileModal();
            });
        }
        
        // Logout button
        const logoutBtn = container.querySelector('#logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    };
    
    // Load dashboard data
    const loadDashboardData = async () => {
        if (isLoading) return;
        
        isLoading = true;
        
        try {
            // Load user's bookings
            const response = await store.api.booking.getUserBookings();
            bookings = response.data.bookings || [];
            
            // Update statistics
            updateStatistics();
            
            // Render recent bookings
            renderRecentBookings();
            
            // Render upcoming bookings
            renderUpcomingBookings();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            
            if (onShowNotification) {
                onShowNotification({
                    type: 'error',
                    title: 'Load Failed',
                    message: 'Failed to load dashboard data. Please try again.',
                    duration: 5000
                });
            }
            
        } finally {
            isLoading = false;
        }
    };
    
    // Update statistics
    const updateStatistics = () => {
        const now = new Date();
        
        const activeBookings = bookings.filter(booking => 
            booking.status === 'active'
        ).length;
        
        const upcomingBookings = bookings.filter(booking => 
            booking.status === 'active' && 
            new Date(booking.date) > now
        ).length;
        
        const totalBookings = bookings.length;
        
        // Update counts in UI
        const activeCount = container.querySelector('#active-bookings-count');
        const upcomingCount = container.querySelector('#upcoming-bookings-count');
        const totalCount = container.querySelector('#total-bookings-count');
        const upcomingBadge = container.querySelector('#upcoming-count');
        
        if (activeCount) activeCount.textContent = activeBookings;
        if (upcomingCount) upcomingCount.textContent = upcomingBookings;
        if (totalCount) totalCount.textContent = totalBookings;
        if (upcomingBadge) upcomingBadge.textContent = `${upcomingBookings} upcoming`;
    };
    
    // Render recent bookings
    const renderRecentBookings = () => {
        const recentBookingsList = container.querySelector('#recent-bookings-list');
        if (!recentBookingsList) return;
        
        // Sort by date (newest first) and take first 3
        const recent = [...bookings]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);
        
        if (recent.length === 0) {
            recentBookingsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No Bookings Yet</h3>
                    <p>You haven't made any bookings yet.</p>
                    <button class="btn btn-primary" id="make-first-booking">
                        Make Your First Booking
                    </button>
                </div>
            `;
            
            const makeFirstBooking = recentBookingsList.querySelector('#make-first-booking');
            if (makeFirstBooking) {
                makeFirstBooking.addEventListener('click', () => {
                    onNavigate('/booking');
                });
            }
            
            return;
        }
        
        recentBookingsList.innerHTML = recent.map(booking => `
            <div class="booking-item ${booking.status}">
                <div class="booking-header">
                    <span class="booking-type">${booking.courtType.toUpperCase()}</span>
                    <span class="booking-status ${booking.status}">${booking.status}</span>
                </div>
                <div class="booking-details">
                    <div class="booking-info">
                        <h4>Court ${booking.courtNumber}</h4>
                        <p>${formatDate(booking.date, 'full')}</p>
                        <p>${booking.timeSlot} • ${booking.duration} hour${booking.duration !== 1 ? 's' : ''}</p>
                    </div>
                    <div class="booking-price">
                        <span class="price">${booking.totalPrice} EGP</span>
                    </div>
                </div>
                <div class="booking-actions">
                    ${booking.status === 'active' ? `
                        <button class="btn btn-outline btn-sm view-booking" data-id="${booking._id}">
                            View
                        </button>
                        <button class="btn btn-outline btn-sm cancel-booking" data-id="${booking._id}">
                            Cancel
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
        
        // Add event listeners to booking buttons
        const viewButtons = recentBookingsList.querySelectorAll('.view-booking');
        const cancelButtons = recentBookingsList.querySelectorAll('.cancel-booking');
        
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const bookingId = e.target.dataset.id;
                viewBookingDetails(bookingId);
            });
        });
        
        cancelButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const bookingId = e.target.dataset.id;
                cancelBooking(bookingId);
            });
        });
    };
    
    // Render upcoming bookings
    const renderUpcomingBookings = () => {
        const upcomingBookingsList = container.querySelector('#upcoming-bookings-list');
        if (!upcomingBookingsList) return;
        
        const now = new Date();
        const upcoming = bookings
            .filter(booking => 
                booking.status === 'active' && 
                new Date(booking.date) > now
            )
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (upcoming.length === 0) {
            upcomingBookingsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-plus"></i>
                    <h3>No Upcoming Bookings</h3>
                    <p>You don't have any upcoming court bookings.</p>
                </div>
            `;
            return;
        }
        
        upcomingBookingsList.innerHTML = upcoming.map(booking => `
            <div class="booking-item upcoming">
                <div class="booking-date">
                    <div class="date-day">${new Date(booking.date).getDate()}</div>
                    <div class="date-month">${new Date(booking.date).toLocaleString('default', { month: 'short' })}</div>
                </div>
                <div class="booking-info">
                    <h4>Court ${booking.courtNumber} (${booking.courtType})</h4>
                    <p>${booking.timeSlot} • ${booking.duration} hour${booking.duration !== 1 ? 's' : ''}</p>
                    <p class="time-remaining" data-date="${booking.date}T${booking.timeSlot}:00">
                        <!-- Time remaining will be calculated by JavaScript -->
                    </p>
                </div>
                <div class="booking-actions">
                    <button class="btn btn-outline btn-sm view-booking" data-id="${booking._id}">
                        Details
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners
        const viewButtons = upcomingBookingsList.querySelectorAll('.view-booking');
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const bookingId = e.target.dataset.id;
                viewBookingDetails(bookingId);
            });
        });
        
        // Update time remaining
        updateTimeRemaining();
    };
    
    // Update time remaining for upcoming bookings
    const updateTimeRemaining = () => {
        const timeElements = container.querySelectorAll('.time-remaining');
        
        timeElements.forEach(element => {
            const bookingTime = new Date(element.dataset.date);
            const now = new Date();
            const diff = bookingTime - now;
            
            if (diff <= 0) {
                element.textContent = 'Started';
                return;
            }
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            if (hours > 0) {
                element.textContent = `In ${hours}h ${minutes}m`;
            } else {
                element.textContent = `In ${minutes}m`;
            }
        });
    };
    
    // View booking details
    const viewBookingDetails = (bookingId) => {
        const booking = bookings.find(b => b._id === bookingId);
        if (!booking) return;
        
        if (onShowNotification) {
            onShowNotification({
                type: 'info',
                title: 'Booking Details',
                message: `Court ${booking.courtNumber} on ${formatDate(booking.date, 'full')} at ${booking.timeSlot}`,
                duration: 5000
            });
        }
    };
    
    // Cancel booking
    const cancelBooking = async (bookingId) => {
        if (!confirm('Are you sure you want to cancel this booking?')) {
            return;
        }
        
        try {
            await store.api.booking.cancelBooking(bookingId);
            
            if (onShowNotification) {
                onShowNotification({
                    type: 'success',
                    title: 'Booking Cancelled',
                    message: 'Your booking has been cancelled successfully.',
                    duration: 3000
                });
            }
            
            // Reload dashboard data
            await loadDashboardData();
            
        } catch (error) {
            console.error('Error cancelling booking:', error);
            
            if (onShowNotification) {
                onShowNotification({
                    type: 'error',
                    title: 'Cancellation Failed',
                    message: error.message || 'Failed to cancel booking. Please try again.',
                    duration: 5000
                });
            }
        }
    };
    
    // Show edit profile modal
    const showEditProfileModal = () => {
        if (onShowNotification) {
            onShowNotification({
                type: 'info',
                title: 'Edit Profile',
                message: 'Profile editing feature is coming soon!',
                duration: 5000
            });
        }
    };
    
    // Handle logout
    const handleLogout = async () => {
        try {
            await store.auth.logout();
            
            if (onShowNotification) {
                onShowNotification({
                    type: 'success',
                    title: 'Logged Out',
                    message: 'You have been logged out successfully.',
                    duration: 3000
                });
            }
            
            onNavigate('/');
            
        } catch (error) {
            console.error('Logout error:', error);
        }
    };
    
    return {
        render,
        init
    };
}