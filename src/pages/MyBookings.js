/**
 * OKZ Sports - My Bookings Page
 * Developed by S.R.C Laboratories
 * User's booking history and management
 */

import { formatDate, formatTimeSlot, getRelativeDate } from '../utils/date.js';
import { showNotification } from '../utils/notification.js';

export default function MyBookings({ store, router, onNavigate, onShowNotification }) {
    const container = document.createElement('div');
    container.className = 'my-bookings-page';
    
    let bookings = [];
    let filteredBookings = [];
    let currentFilter = 'all';
    let currentPage = 1;
    const itemsPerPage = 10;
    let isLoading = false;
    
    // Render function
    const render = () => {
        if (!store.auth.isAuthenticated()) {
            onNavigate('/login');
            return container;
        }
        
        const user = store.auth.getUser();
        
        container.innerHTML = `
            <div class="bookings-container">
                <!-- Header -->
                <div class="bookings-header">
                    <h1>My Bookings</h1>
                    <p>Manage and view your court bookings</p>
                </div>
                
                <!-- Filter Tabs -->
                <div class="filter-tabs">
                    <button class="filter-tab ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">
                        All Bookings
                    </button>
                    <button class="filter-tab ${currentFilter === 'active' ? 'active' : ''}" data-filter="active">
                        Active
                    </button>
                    <button class="filter-tab ${currentFilter === 'upcoming' ? 'active' : ''}" data-filter="upcoming">
                        Upcoming
                    </button>
                    <button class="filter-tab ${currentFilter === 'past' ? 'active' : ''}" data-filter="past">
                        Past
                    </button>
                    <button class="filter-tab ${currentFilter === 'cancelled' ? 'active' : ''}" data-filter="cancelled">
                        Cancelled
                    </button>
                </div>
                
                <!-- Bookings List -->
                <div class="bookings-list-section">
                    <div class="bookings-list-header">
                        <h2 id="bookings-count">Loading bookings...</h2>
                        <div class="sort-controls">
                            <select id="sort-by" class="sort-select">
                                <option value="date-desc">Newest First</option>
                                <option value="date-asc">Oldest First</option>
                                <option value="court">Court Number</option>
                                <option value="type">Court Type</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="bookings-list" id="bookings-list">
                        <div class="loading-placeholder">
                            <div class="spinner"></div>
                            <p>Loading your bookings...</p>
                        </div>
                    </div>
                    
                    <!-- Pagination -->
                    <div class="pagination" id="pagination" style="display: none;">
                        <!-- Pagination will be dynamically generated -->
                    </div>
                </div>
                
                <!-- Empty State (hidden by default) -->
                <div class="empty-state" id="empty-state" style="display: none;">
                    <div class="empty-icon">
                        <i class="fas fa-calendar-times"></i>
                    </div>
                    <h3>No Bookings Found</h3>
                    <p>You don't have any ${currentFilter === 'all' ? '' : currentFilter} bookings yet.</p>
                    ${currentFilter === 'active' || currentFilter === 'upcoming' || currentFilter === 'all' ? `
                        <button class="btn btn-primary" id="book-now-btn">
                            <i class="fas fa-plus"></i> Book a Court
                        </button>
                    ` : ''}
                </div>
                
                <!-- Quick Stats -->
                <div class="booking-stats">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="total-count">0</h3>
                            <p>Total Bookings</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="active-count">0</h3>
                            <p>Active</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="completed-count">0</h3>
                            <p>Completed</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-times-circle"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="cancelled-count">0</h3>
                            <p>Cancelled</p>
                        </div>
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
        
        setupEventListeners();
        await loadBookings();
    };
    
    // Setup event listeners
    const setupEventListeners = () => {
        // Filter tabs
        const filterTabs = container.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                applyFilter(filter);
            });
        });
        
        // Sort select
        const sortSelect = container.querySelector('#sort-by');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                sortBookings(e.target.value);
                renderBookingsList();
            });
        }
        
        // Book now button (in empty state)
        container.addEventListener('click', (e) => {
            if (e.target.id === 'book-now-btn') {
                onNavigate('/booking');
            }
        });
    };
    
    // Load bookings
    const loadBookings = async () => {
        if (isLoading) return;
        
        isLoading = true;
        
        try {
            // Load all bookings
            const response = await store.api.booking.getUserBookings('all', 1, 100);
            bookings = response.data.bookings || [];
            
            // Update statistics
            updateStatistics();
            
            // Apply current filter
            applyFilter(currentFilter);
            
        } catch (error) {
            console.error('Error loading bookings:', error);
            
            if (onShowNotification) {
                onShowNotification({
                    type: 'error',
                    title: 'Load Failed',
                    message: 'Failed to load bookings. Please try again.',
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
        
        const total = bookings.length;
        const active = bookings.filter(b => b.status === 'active').length;
        const completed = bookings.filter(b => b.status === 'completed').length;
        const cancelled = bookings.filter(b => b.status === 'cancelled').length;
        
        // Update UI
        const totalCount = container.querySelector('#total-count');
        const activeCount = container.querySelector('#active-count');
        const completedCount = container.querySelector('#completed-count');
        const cancelledCount = container.querySelector('#cancelled-count');
        
        if (totalCount) totalCount.textContent = total;
        if (activeCount) activeCount.textContent = active;
        if (completedCount) completedCount.textContent = completed;
        if (cancelledCount) cancelledCount.textContent = cancelled;
    };
    
    // Apply filter
    const applyFilter = (filter) => {
        currentFilter = filter;
        currentPage = 1;
        
        // Update active tab
        const filterTabs = container.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filter);
        });
        
        // Filter bookings
        const now = new Date();
        
        switch (filter) {
            case 'active':
                filteredBookings = bookings.filter(b => b.status === 'active');
                break;
            case 'upcoming':
                filteredBookings = bookings.filter(b => 
                    b.status === 'active' && new Date(b.date) > now
                );
                break;
            case 'past':
                filteredBookings = bookings.filter(b => 
                    (b.status === 'completed' || b.status === 'cancelled') || 
                    (b.status === 'active' && new Date(b.date) < now)
                );
                break;
            case 'cancelled':
                filteredBookings = bookings.filter(b => b.status === 'cancelled');
                break;
            default: // 'all'
                filteredBookings = [...bookings];
                break;
        }
        
        // Update bookings count display
        const bookingsCount = container.querySelector('#bookings-count');
        if (bookingsCount) {
            bookingsCount.textContent = `${filteredBookings.length} ${filter === 'all' ? '' : filter} booking${filteredBookings.length !== 1 ? 's' : ''}`;
        }
        
        // Apply current sort
        const sortSelect = container.querySelector('#sort-by');
        if (sortSelect) {
            sortBookings(sortSelect.value);
        } else {
            sortBookings('date-desc');
        }
        
        renderBookingsList();
    };
    
    // Sort bookings
    const sortBookings = (sortBy) => {
        switch (sortBy) {
            case 'date-asc':
                filteredBookings.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'court':
                filteredBookings.sort((a, b) => a.courtNumber - b.courtNumber);
                break;
            case 'type':
                filteredBookings.sort((a, b) => a.courtType.localeCompare(b.courtType));
                break;
            default: // 'date-desc'
                filteredBookings.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
        }
    };
    
    // Render bookings list
    const renderBookingsList = () => {
        const bookingsList = container.querySelector('#bookings-list');
        const emptyState = container.querySelector('#empty-state');
        const pagination = container.querySelector('#pagination');
        
        if (!bookingsList || !emptyState || !pagination) return;
        
        if (filteredBookings.length === 0) {
            bookingsList.style.display = 'none';
            emptyState.style.display = 'block';
            pagination.style.display = 'none';
            return;
        }
        
        bookingsList.style.display = 'block';
        emptyState.style.display = 'none';
        
        // Calculate pagination
        const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentBookings = filteredBookings.slice(startIndex, endIndex);
        
        // Render bookings
        bookingsList.innerHTML = currentBookings.map(booking => `
            <div class="booking-card ${booking.status}">
                <div class="booking-card-header">
                    <div class="booking-type-badge">
                        <i class="fas fa-${booking.courtType === 'paddle' ? 'table-tennis-paddle-ball' : 'baseball'}"></i>
                        <span>${booking.courtType.toUpperCase()}</span>
                    </div>
                    <div class="booking-status-badge ${booking.status}">
                        ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </div>
                </div>
                
                <div class="booking-card-body">
                    <div class="booking-info">
                        <h3>Court ${booking.courtNumber}</h3>
                        <p class="booking-date">
                            <i class="fas fa-calendar"></i>
                            ${formatDate(booking.date, 'full')}
                        </p>
                        <p class="booking-time">
                            <i class="fas fa-clock"></i>
                            ${formatTimeSlot(booking.timeSlot)} • ${booking.duration} hour${booking.duration !== 1 ? 's' : ''}
                        </p>
                        ${booking.status === 'active' && new Date(booking.date) > new Date() ? `
                            <p class="booking-relative">
                                <i class="fas fa-hourglass-half"></i>
                                ${getRelativeDate(booking.date)}
                            </p>
                        ` : ''}
                    </div>
                    
                    <div class="booking-price">
                        <div class="price-amount">${booking.totalPrice} EGP</div>
                        <div class="price-breakdown">${booking.price} EGP/hour × ${booking.duration} hour${booking.duration !== 1 ? 's' : ''}</div>
                    </div>
                </div>
                
                <div class="booking-card-footer">
                    <div class="booking-meta">
                        <span class="booking-id">Booking ID: ${booking._id.slice(-8)}</span>
                        <span class="booking-created">Booked on: ${formatDate(booking.createdAt, 'short')}</span>
                    </div>
                    
                    <div class="booking-actions">
                        ${booking.status === 'active' && new Date(booking.date) > new Date() ? `
                            <button class="btn btn-outline btn-sm cancel-booking-btn" data-id="${booking._id}">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                        ` : ''}
                        <button class="btn btn-outline btn-sm view-details-btn" data-id="${booking._id}">
                            <i class="fas fa-eye"></i> Details
                        </button>
                        ${booking.status === 'active' && new Date(booking.date) <= new Date() ? `
                            <button class="btn btn-primary btn-sm check-in-btn" data-id="${booking._id}">
                                <i class="fas fa-check-in"></i> Check In
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to booking buttons
        addBookingEventListeners();
        
        // Render pagination
        if (totalPages > 1) {
            pagination.style.display = 'block';
            pagination.innerHTML = `
                <div class="pagination-controls">
                    <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
                            id="prev-page" ${currentPage === 1 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-left"></i> Previous
                    </button>
                    
                    <div class="page-numbers">
                        ${Array.from({ length: totalPages }, (_, i) => i + 1)
                            .map(page => `
                                <button class="page-number ${page === currentPage ? 'active' : ''}" 
                                        data-page="${page}">
                                    ${page}
                                </button>
                            `).join('')}
                    </div>
                    
                    <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                            id="next-page" ${currentPage === totalPages ? 'disabled' : ''}>
                        Next <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            `;
            
            // Add pagination event listeners
            const prevPageBtn = container.querySelector('#prev-page');
            const nextPageBtn = container.querySelector('#next-page');
            const pageNumberBtns = container.querySelectorAll('.page-number');
            
            if (prevPageBtn) {
                prevPageBtn.addEventListener('click', () => {
                    if (currentPage > 1) {
                        currentPage--;
                        renderBookingsList();
                    }
                });
            }
            
            if (nextPageBtn) {
                nextPageBtn.addEventListener('click', () => {
                    if (currentPage < totalPages) {
                        currentPage++;
                        renderBookingsList();
                    }
                });
            }
            
            pageNumberBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    currentPage = parseInt(e.target.dataset.page);
                    renderBookingsList();
                });
            });
        } else {
            pagination.style.display = 'none';
        }
    };
    
    // Add event listeners to booking buttons
    const addBookingEventListeners = () => {
        // Cancel booking buttons
        const cancelButtons = container.querySelectorAll('.cancel-booking-btn');
        cancelButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const bookingId = e.target.closest('.cancel-booking-btn').dataset.id;
                cancelBooking(bookingId);
            });
        });
        
        // View details buttons
        const viewDetailsButtons = container.querySelectorAll('.view-details-btn');
        viewDetailsButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const bookingId = e.target.closest('.view-details-btn').dataset.id;
                viewBookingDetails(bookingId);
            });
        });
        
        // Check in buttons
        const checkInButtons = container.querySelectorAll('.check-in-btn');
        checkInButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const bookingId = e.target.closest('.check-in-btn').dataset.id;
                checkInBooking(bookingId);
            });
        });
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
            
            // Reload bookings
            await loadBookings();
            
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
    
    // View booking details
    const viewBookingDetails = (bookingId) => {
        const booking = bookings.find(b => b._id === bookingId);
        if (!booking) return;
        
        // In a real app, this would show a detailed modal
        if (onShowNotification) {
            onShowNotification({
                type: 'info',
                title: 'Booking Details',
                message: `
                    Court ${booking.courtNumber} (${booking.courtType})
                    Date: ${formatDate(booking.date, 'full')}
                    Time: ${formatTimeSlot(booking.timeSlot)}
                    Duration: ${booking.duration} hour${booking.duration !== 1 ? 's' : ''}
                    Status: ${booking.status}
                    Total: ${booking.totalPrice} EGP
                `.trim().replace(/\s+/g, ' '),
                duration: 8000
            });
        }
    };
    
    // Check in booking
    const checkInBooking = (bookingId) => {
        if (onShowNotification) {
            onShowNotification({
                type: 'info',
                title: 'Check In',
                message: 'Check-in feature is coming soon! Please check in at the reception.',
                duration: 5000
            });
        }
    };
    
    return {
        render,
        init
    };
}