/**
 * OKZ Sports - Admin Bookings Page
 * Developed by S.R.C Laboratories
 * Administrator booking management interface
 */

import { formatDate, formatTimeSlot, getRelativeDate } from '../utils/date.js';
import { showNotification } from '../utils/notification.js';

export default function AdminBookings({ store, router, onNavigate, onShowNotification }) {
    const container = document.createElement('div');
    container.className = 'admin-bookings-page';
    
    let activeBookings = [];
    let bookingHistory = [];
    let currentView = 'active'; // 'active' or 'history'
    let isLoading = false;
    
    // Render function
    const render = () => {
        if (!store.auth.isAdminAuthenticated()) {
            onNavigate('/admin/login');
            return container;
        }
        
        container.innerHTML = `
            <div class="admin-bookings-container">
                <!-- Header -->
                <div class="admin-header">
                    <h1>Booking Management</h1>
                    <p>Manage all court bookings at OKZ Sports</p>
                </div>
                
                <!-- View Toggle -->
                <div class="view-toggle-section">
                    <div class="view-toggle">
                        <button class="view-toggle-btn ${currentView === 'active' ? 'active' : ''}" 
                                data-view="active">
                            <i class="fas fa-clock"></i> Active Bookings
                            <span class="badge" id="active-count">0</span>
                        </button>
                        <button class="view-toggle-btn ${currentView === 'history' ? 'active' : ''}" 
                                data-view="history">
                            <i class="fas fa-history"></i> Booking History
                            <span class="badge" id="history-count">0</span>
                        </button>
                    </div>
                    
                    <div class="view-controls">
                        <div class="date-filter" style="${currentView === 'history' ? 'display: block;' : 'display: none;'}" 
                             id="date-filter">
                            <input type="date" id="start-date" placeholder="Start Date">
                            <span>to</span>
                            <input type="date" id="end-date" placeholder="End Date">
                            <button class="btn btn-outline btn-sm" id="apply-date-filter">
                                <i class="fas fa-filter"></i> Apply
                            </button>
                        </div>
                        
                        <button class="btn btn-primary btn-sm" id="refresh-bookings">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                </div>
                
                <!-- Active Bookings View -->
                <div class="bookings-view ${currentView === 'active' ? 'active' : ''}" id="active-view">
                    <div class="bookings-table-container">
                        <table class="bookings-table">
                            <thead>
                                <tr>
                                    <th>Booking ID</th>
                                    <th>Court</th>
                                    <th>User</th>
                                    <th>Date & Time</th>
                                    <th>Duration</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="active-bookings-table">
                                <tr>
                                    <td colspan="8" class="loading-cell">
                                        <div class="spinner"></div>
                                        <p>Loading active bookings...</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="bookings-summary">
                        <div class="summary-card">
                            <h3>Today's Summary</h3>
                            <div class="summary-stats">
                                <div class="stat">
                                    <span class="stat-label">Total Bookings:</span>
                                    <span class="stat-value" id="today-total">0</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Paddle Courts:</span>
                                    <span class="stat-value" id="today-paddle">0</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Tennis Courts:</span>
                                    <span class="stat-value" id="today-tennis">0</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Estimated Revenue:</span>
                                    <span class="stat-value" id="today-revenue">0 EGP</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Booking History View -->
                <div class="bookings-view ${currentView === 'history' ? 'active' : ''}" id="history-view">
                    <div class="bookings-table-container">
                        <table class="bookings-table">
                            <thead>
                                <tr>
                                    <th>Booking ID</th>
                                    <th>Court</th>
                                    <th>User</th>
                                    <th>Date & Time</th>
                                    <th>Duration</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                </tr>
                            </thead>
                            <tbody id="history-bookings-table">
                                <tr>
                                    <td colspan="8" class="loading-cell">
                                        <div class="spinner"></div>
                                        <p>Loading booking history...</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="history-summary">
                        <div class="summary-card">
                            <h3>History Summary</h3>
                            <div class="summary-stats">
                                <div class="stat">
                                    <span class="stat-label">Total Bookings:</span>
                                    <span class="stat-value" id="history-total">0</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Completed:</span>
                                    <span class="stat-value" id="history-completed">0</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Cancelled:</span>
                                    <span class="stat-value" id="history-cancelled">0</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-label">Total Revenue:</span>
                                    <span class="stat-value" id="history-revenue">0 EGP</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Action Modal (hidden) -->
                <div class="modal" id="action-modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 id="modal-title">Booking Action</h3>
                            <button class="modal-close" id="modal-close">&times;</button>
                        </div>
                        <div class="modal-body" id="modal-body">
                            <!-- Modal content will be loaded here -->
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-outline" id="modal-cancel">Cancel</button>
                            <button class="btn btn-primary" id="modal-confirm">Confirm</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return container;
    };
    
    // Initialize component
    const init = async () => {
        if (!store.auth.isAdminAuthenticated()) {
            onNavigate('/admin/login');
            return;
        }
        
        setupEventListeners();
        await loadBookings();
    };
    
    // Setup event listeners
    const setupEventListeners = () => {
        // View toggle buttons
        const viewToggleBtns = container.querySelectorAll('.view-toggle-btn');
        viewToggleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                switchView(view);
            });
        });
        
        // Refresh button
        const refreshBtn = container.querySelector('#refresh-bookings');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                loadBookings();
            });
        }
        
        // Apply date filter button
        const applyFilterBtn = container.querySelector('#apply-date-filter');
        if (applyFilterBtn) {
            applyFilterBtn.addEventListener('click', () => {
                applyDateFilter();
            });
        }
        
        // Modal close button
        const modalClose = container.querySelector('#modal-close');
        const modalCancel = container.querySelector('#modal-cancel');
        
        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }
        
        if (modalCancel) {
            modalCancel.addEventListener('click', closeModal);
        }
    };
    
    // Switch between active and history views
    const switchView = (view) => {
        currentView = view;
        
        // Update active button
        const viewToggleBtns = container.querySelectorAll('.view-toggle-btn');
        viewToggleBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Show/hide date filter
        const dateFilter = container.querySelector('#date-filter');
        if (dateFilter) {
            dateFilter.style.display = view === 'history' ? 'block' : 'none';
        }
        
        // Show/hide views
        const activeView = container.querySelector('#active-view');
        const historyView = container.querySelector('#history-view');
        
        if (activeView) activeView.classList.toggle('active', view === 'active');
        if (historyView) historyView.classList.toggle('active', view === 'history');
        
        // Load data for the selected view
        if (view === 'active') {
            renderActiveBookings();
        } else {
            renderBookingHistory();
        }
    };
    
    // Load bookings
    const loadBookings = async () => {
        if (isLoading) return;
        
        isLoading = true;
        
        try {
            // Load active bookings
            const activeResponse = await store.api.admin.getActiveBookings();
            activeBookings = activeResponse.data.bookings || [];
            
            // Load booking history
            const historyResponse = await store.api.admin.getBookingHistory();
            bookingHistory = historyResponse.data.bookings || [];
            
            // Update counts
            updateCounts();
            
            // Render current view
            if (currentView === 'active') {
                renderActiveBookings();
                updateTodaySummary();
            } else {
                renderBookingHistory();
                updateHistorySummary();
            }
            
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
    
    // Update counts
    const updateCounts = () => {
        const activeCount = container.querySelector('#active-count');
        const historyCount = container.querySelector('#history-count');
        
        if (activeCount) {
            activeCount.textContent = activeBookings.length;
        }
        
        if (historyCount) {
            historyCount.textContent = bookingHistory.length;
        }
    };
    
    // Render active bookings table
    const renderActiveBookings = () => {
        const tableBody = container.querySelector('#active-bookings-table');
        if (!tableBody) return;
        
        if (activeBookings.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-cell">
                        <div class="empty-state">
                            <i class="fas fa-calendar-times"></i>
                            <p>No active bookings found.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = activeBookings.map(booking => `
            <tr data-id="${booking._id}">
                <td class="booking-id">${booking._id.slice(-8)}</td>
                <td class="court-info">
                    <span class="court-type">${booking.courtType.toUpperCase()}</span>
                    <span class="court-number">Court ${booking.courtNumber}</span>
                </td>
                <td class="user-info">
                    <div class="user-name">${booking.user?.fullName || booking.user?.email || 'N/A'}</div>
                    <div class="user-contact">${booking.user?.phoneNumber || ''}</div>
                </td>
                <td class="booking-time">
                    <div class="booking-date">${formatDate(booking.date, 'short')}</div>
                    <div class="booking-slot">${formatTimeSlot(booking.timeSlot)}</div>
                </td>
                <td class="booking-duration">${booking.duration} hour${booking.duration !== 1 ? 's' : ''}</td>
                <td class="booking-amount">${booking.totalPrice} EGP</td>
                <td class="booking-status">
                    <span class="status-badge ${booking.status}">${booking.status}</span>
                </td>
                <td class="booking-actions">
                    <button class="btn-action view-booking" data-id="${booking._id}" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action edit-booking" data-id="${booking._id}" title="Edit Status">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action cancel-booking ${booking.status === 'cancelled' ? 'disabled' : ''}" 
                            data-id="${booking._id}" title="Cancel Booking" ${booking.status === 'cancelled' ? 'disabled' : ''}>
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Add event listeners to action buttons
        addActiveBookingsEventListeners();
    };
    
    // Add event listeners to active bookings action buttons
    const addActiveBookingsEventListeners = () => {
        // View booking buttons
        const viewButtons = container.querySelectorAll('.view-booking');
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const bookingId = e.target.closest('.view-booking').dataset.id;
                viewBookingDetails(bookingId);
            });
        });
        
        // Edit booking buttons
        const editButtons = container.querySelectorAll('.edit-booking');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const bookingId = e.target.closest('.edit-booking').dataset.id;
                showEditBookingModal(bookingId);
            });
        });
        
        // Cancel booking buttons
        const cancelButtons = container.querySelectorAll('.cancel-booking:not(.disabled)');
        cancelButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const bookingId = e.target.closest('.cancel-booking').dataset.id;
                showCancelBookingModal(bookingId);
            });
        });
    };
    
    // Update today's summary
    const updateTodaySummary = () => {
        const today = new Date().toISOString().split('T')[0];
        const todayBookings = activeBookings.filter(booking => 
            booking.date.startsWith(today)
        );
        
        const paddleBookings = todayBookings.filter(b => b.courtType === 'paddle').length;
        const tennisBookings = todayBookings.filter(b => b.courtType === 'tennis').length;
        const totalRevenue = todayBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
        
        // Update UI
        const todayTotal = container.querySelector('#today-total');
        const todayPaddle = container.querySelector('#today-paddle');
        const todayTennis = container.querySelector('#today-tennis');
        const todayRevenue = container.querySelector('#today-revenue');
        
        if (todayTotal) todayTotal.textContent = todayBookings.length;
        if (todayPaddle) todayPaddle.textContent = paddleBookings;
        if (todayTennis) todayTennis.textContent = tennisBookings;
        if (todayRevenue) todayRevenue.textContent = `${totalRevenue} EGP`;
    };
    
    // Render booking history table
    const renderBookingHistory = () => {
        const tableBody = container.querySelector('#history-bookings-table');
        if (!tableBody) return;
        
        if (bookingHistory.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-cell">
                        <div class="empty-state">
                            <i class="fas fa-history"></i>
                            <p>No booking history found.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = bookingHistory.map(booking => `
            <tr data-id="${booking._id}">
                <td class="booking-id">${booking._id.slice(-8)}</td>
                <td class="court-info">
                    <span class="court-type">${booking.courtType.toUpperCase()}</span>
                    <span class="court-number">Court ${booking.courtNumber}</span>
                </td>
                <td class="user-info">
                    <div class="user-name">${booking.user?.fullName || booking.user?.email || 'N/A'}</div>
                    <div class="user-contact">${booking.user?.phoneNumber || ''}</div>
                </td>
                <td class="booking-time">
                    <div class="booking-date">${formatDate(booking.date, 'short')}</div>
                    <div class="booking-slot">${formatTimeSlot(booking.timeSlot)}</div>
                </td>
                <td class="booking-duration">${booking.duration} hour${booking.duration !== 1 ? 's' : ''}</td>
                <td class="booking-amount">${booking.totalPrice} EGP</td>
                <td class="booking-status">
                    <span class="status-badge ${booking.status}">${booking.status}</span>
                </td>
                <td class="payment-status">
                    <span class="payment-badge ${booking.paymentStatus}">${booking.paymentStatus}</span>
                </td>
            </tr>
        `).join('');
    };
    
    // Update history summary
    const updateHistorySummary = () => {
        const completed = bookingHistory.filter(b => b.status === 'completed').length;
        const cancelled = bookingHistory.filter(b => b.status === 'cancelled').length;
        const totalRevenue = bookingHistory.reduce((sum, booking) => sum + booking.totalPrice, 0);
        
        // Update UI
        const historyTotal = container.querySelector('#history-total');
        const historyCompleted = container.querySelector('#history-completed');
        const historyCancelled = container.querySelector('#history-cancelled');
        const historyRevenue = container.querySelector('#history-revenue');
        
        if (historyTotal) historyTotal.textContent = bookingHistory.length;
        if (historyCompleted) historyCompleted.textContent = completed;
        if (historyCancelled) historyCancelled.textContent = cancelled;
        if (historyRevenue) historyRevenue.textContent = `${totalRevenue} EGP`;
    };
    
    // Apply date filter
    const applyDateFilter = async () => {
        const startDate = container.querySelector('#start-date').value;
        const endDate = container.querySelector('#end-date').value;
        
        if (!startDate && !endDate) {
            // Load all history if no dates specified
            await loadBookings();
            return;
        }
        
        isLoading = true;
        
        try {
            const filters = {};
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;
            
            const response = await store.api.admin.getBookingHistory(filters);
            bookingHistory = response.data.bookings || [];
            
            renderBookingHistory();
            updateHistorySummary();
            
        } catch (error) {
            console.error('Error applying date filter:', error);
            
            if (onShowNotification) {
                onShowNotification({
                    type: 'error',
                    title: 'Filter Failed',
                    message: 'Failed to apply date filter. Please try again.',
                    duration: 5000
                });
            }
            
        } finally {
            isLoading = false;
        }
    };
    
    // View booking details
    const viewBookingDetails = (bookingId) => {
        const booking = [...activeBookings, ...bookingHistory].find(b => b._id === bookingId);
        if (!booking) return;
        
        const modal = container.querySelector('#action-modal');
        const modalTitle = container.querySelector('#modal-title');
        const modalBody = container.querySelector('#modal-body');
        const modalConfirm = container.querySelector('#modal-confirm');
        
        if (!modal || !modalTitle || !modalBody || !modalConfirm) return;
        
        modalTitle.textContent = 'Booking Details';
        modalBody.innerHTML = `
            <div class="booking-details-modal">
                <div class="detail-row">
                    <span class="detail-label">Booking ID:</span>
                    <span class="detail-value">${booking._id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Court:</span>
                    <span class="detail-value">${booking.courtType.toUpperCase()} Court ${booking.courtNumber}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">User:</span>
                    <span class="detail-value">${booking.user?.fullName || booking.user?.email || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${booking.user?.email || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${booking.user?.phoneNumber || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${formatDate(booking.date, 'full')}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${formatTimeSlot(booking.timeSlot)} (${booking.duration} hour${booking.duration !== 1 ? 's' : ''})</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value status-badge ${booking.status}">${booking.status}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment:</span>
                    <span class="detail-value payment-badge ${booking.paymentStatus}">${booking.paymentStatus}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Amount:</span>
                    <span class="detail-value">${booking.totalPrice} EGP</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Booked On:</span>
                    <span class="detail-value">${formatDate(booking.createdAt, 'datetime')}</span>
                </div>
                ${booking.cancelledAt ? `
                    <div class="detail-row">
                        <span class="detail-label">Cancelled On:</span>
                        <span class="detail-value">${formatDate(booking.cancelledAt, 'datetime')}</span>
                    </div>
                ` : ''}
            </div>
        `;
        
        modalConfirm.textContent = 'Close';
        modalConfirm.onclick = closeModal;
        
        modal.style.display = 'block';
    };
    
    // Show edit booking modal
    const showEditBookingModal = (bookingId) => {
        const booking = activeBookings.find(b => b._id === bookingId);
        if (!booking) return;
        
        const modal = container.querySelector('#action-modal');
        const modalTitle = container.querySelector('#modal-title');
        const modalBody = container.querySelector('#modal-body');
        const modalConfirm = container.querySelector('#modal-confirm');
        
        if (!modal || !modalTitle || !modalBody || !modalConfirm) return;
        
        modalTitle.textContent = 'Update Booking Status';
        modalBody.innerHTML = `
            <div class="edit-booking-modal">
                <div class="current-info">
                    <p><strong>Current Status:</strong> <span class="status-badge ${booking.status}">${booking.status}</span></p>
                    <p><strong>Court:</strong> ${booking.courtType.toUpperCase()} Court ${booking.courtNumber}</p>
                    <p><strong>Date:</strong> ${formatDate(booking.date, 'full')} at ${formatTimeSlot(booking.timeSlot)}</p>
                </div>
                
                <div class="form-group">
                    <label for="status-select">New Status:</label>
                    <select id="status-select" class="form-control">
                        <option value="active" ${booking.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="cancelled" ${booking.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        <option value="completed" ${booking.status === 'completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="admin-notes">Admin Notes:</label>
                    <textarea id="admin-notes" class="form-control" rows="3" 
                              placeholder="Add any notes about this status change..."></textarea>
                </div>
            </div>
        `;
        
        modalConfirm.textContent = 'Update Status';
        modalConfirm.onclick = () => updateBookingStatus(bookingId);
        
        modal.style.display = 'block';
    };
    
    // Show cancel booking modal
    const showCancelBookingModal = (bookingId) => {
        const booking = activeBookings.find(b => b._id === bookingId);
        if (!booking) return;
        
        const modal = container.querySelector('#action-modal');
        const modalTitle = container.querySelector('#modal-title');
        const modalBody = container.querySelector('#modal-body');
        const modalConfirm = container.querySelector('#modal-confirm');
        
        if (!modal || !modalTitle || !modalBody || !modalConfirm) return;
        
        modalTitle.textContent = 'Cancel Booking';
        modalBody.innerHTML = `
            <div class="cancel-booking-modal">
                <div class="warning-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Are you sure you want to cancel this booking?</p>
                </div>
                
                <div class="booking-info">
                    <p><strong>Court:</strong> ${booking.courtType.toUpperCase()} Court ${booking.courtNumber}</p>
                    <p><strong>User:</strong> ${booking.user?.fullName || booking.user?.email}</p>
                    <p><strong>Date:</strong> ${formatDate(booking.date, 'full')} at ${formatTimeSlot(booking.timeSlot)}</p>
                    <p><strong>Amount:</strong> ${booking.totalPrice} EGP</p>
                </div>
                
                <div class="form-group">
                    <label for="cancel-reason">Cancellation Reason:</label>
                    <textarea id="cancel-reason" class="form-control" rows="2" 
                              placeholder="Reason for cancellation..."></textarea>
                </div>
                
                <div class="refund-notice">
                    <i class="fas fa-info-circle"></i>
                    <p>If payment was made, refund will be processed according to cancellation policy.</p>
                </div>
            </div>
        `;
        
        modalConfirm.textContent = 'Confirm Cancellation';
        modalConfirm.onclick = () => cancelBooking(bookingId);
        
        modal.style.display = 'block';
    };
    
    // Update booking status
    const updateBookingStatus = async (bookingId) => {
        const statusSelect = container.querySelector('#status-select');
        const adminNotes = container.querySelector('#admin-notes');
        
        if (!statusSelect) return;
        
        const newStatus = statusSelect.value;
        const notes = adminNotes?.value || '';
        
        try {
            await store.api.admin.updateBookingStatus(bookingId, newStatus, notes);
            
            if (onShowNotification) {
                onShowNotification({
                    type: 'success',
                    title: 'Status Updated',
                    message: `Booking status updated to ${newStatus}.`,
                    duration: 3000
                });
            }
            
            closeModal();
            await loadBookings();
            
        } catch (error) {
            console.error('Error updating booking status:', error);
            
            if (onShowNotification) {
                onShowNotification({
                    type: 'error',
                    title: 'Update Failed',
                    message: 'Failed to update booking status. Please try again.',
                    duration: 5000
                });
            }
        }
    };
    
    // Cancel booking
    const cancelBooking = async (bookingId) => {
        const cancelReason = container.querySelector('#cancel-reason');
        const reason = cancelReason?.value || 'Cancelled by admin';
        
        try {
            await store.api.admin.updateBookingStatus(bookingId, 'cancelled', reason);
            
            if (onShowNotification) {
                onShowNotification({
                    type: 'success',
                    title: 'Booking Cancelled',
                    message: 'Booking has been cancelled successfully.',
                    duration: 3000
                });
            }
            
            closeModal();
            await loadBookings();
            
        } catch (error) {
            console.error('Error cancelling booking:', error);
            
            if (onShowNotification) {
                onShowNotification({
                    type: 'error',
                    title: 'Cancellation Failed',
                    message: 'Failed to cancel booking. Please try again.',
                    duration: 5000
                });
            }
        }
    };
    
    // Close modal
    const closeModal = () => {
        const modal = container.querySelector('#action-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    };
    
    return {
        render,
        init
    };
}