/**
 * OKZ Sports - Admin Dashboard Page
 * Developed by S.R.C Laboratories
 * Administrator dashboard with system overview
 */

import { formatDate, formatTimeSlot } from '../utils/date.js';
import { showNotification } from '../utils/notification.js';

export default function AdminDashboard({ store, router, onNavigate, onShowNotification }) {
    const container = document.createElement('div');
    container.className = 'admin-dashboard-page';
    
    let dashboardData = null;
    let isLoading = false;
    
    // Render function
    const render = () => {
        if (!store.auth.isAdminAuthenticated()) {
            onNavigate('/admin/login');
            return container;
        }
        
        const admin = store.auth.getAdmin();
        
        container.innerHTML = `
            <div class="admin-dashboard-container">
                <!-- Header -->
                <div class="dashboard-header">
                    <div class="header-left">
                        <h1>Admin Dashboard</h1>
                        <p>OKZ Sports Court Management System</p>
                    </div>
                    <div class="header-right">
                        <div class="admin-info">
                            <div class="admin-avatar">
                                <i class="fas fa-user-shield"></i>
                            </div>
                            <div class="admin-details">
                                <h3>${admin.username || 'Admin'}</h3>
                                <p>Administrator</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Stats -->
                <div class="admin-stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon primary">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="today-bookings">0</h3>
                            <p>Today's Bookings</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card">
                        <div class="stat-icon success">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="total-users">0</h3>
                            <p>Total Users</p>
                        </div>
                    </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon warning">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="active-bookings">0</h3>
                            <p>Active Bookings</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon info">
                            <i class="fas fa-money-bill-wave"></i>
                        </div>
                        <div class="stat-content">
                            <h3 id="revenue-today">0 EGP</h3>
                            <p>Today's Revenue</p>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="quick-actions-section">
                    <h2>Quick Actions</h2>
                    <div class="action-buttons">
                        <button class="btn btn-primary" id="manage-bookings-btn">
                            <i class="fas fa-clipboard-list"></i> Manage Bookings
                        </button>
                        <button class="btn btn-outline" id="view-reports-btn">
                            <i class="fas fa-chart-bar"></i> View Reports
                        </button>
                        <button class="btn btn-outline" id="system-settings-btn">
                            <i class="fas fa-cog"></i> System Settings
                        </button>
                    </div>
                </div>
                
                <!-- Recent Activity -->
                <div class="recent-activity-section">
                    <div class="section-header">
                        <h2>Recent Activity</h2>
                        <button class="btn btn-outline btn-sm" id="refresh-activity">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                    
                    <div class="activity-list" id="activity-list">
                        <div class="loading-placeholder">
                            <div class="spinner"></div>
                            <p>Loading activity...</p>
                        </div>
                    </div>
                </div>
                
                <!-- Court Utilization -->
                <div class="court-utilization-section">
                    <div class="section-header">
                        <h2>Court Utilization</h2>
                        <div class="view-toggle">
                            <button class="view-toggle-btn active" data-view="paddle">Paddle Courts</button>
                            <button class="view-toggle-btn" data-view="tennis">Tennis Courts</button>
                            <button class="view-toggle-btn" data-view="all">All Courts</button>
                        </div>
                    </div>
                    
                    <div class="utilization-grid" id="utilization-grid">
                        <div class="loading-placeholder">
                            <div class="spinner"></div>
                            <p>Loading court utilization...</p>
                        </div>
                    </div>
                </div>
                
                <!-- System Info -->
                <div class="system-info-card">
                    <h3><i class="fas fa-info-circle"></i> System Information</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Total Courts:</span>
                            <span class="info-value">5</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Paddle Courts:</span>
                            <span class="info-value">2 (1-2)</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Tennis Courts:</span>
                            <span class="info-value">3 (3-5)</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Price per Hour:</span>
                            <span class="info-value">400 EGP</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Operating Hours:</span>
                            <span class="info-value">8:00 AM - 10:00 PM</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Max Booking Hours:</span>
                            <span class="info-value">4 hours</span>
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
        await loadDashboardData();
    };
    
    // Setup event listeners
    const setupEventListeners = () => {
        // Manage bookings button
        const manageBookingsBtn = container.querySelector('#manage-bookings-btn');
        if (manageBookingsBtn) {
            manageBookingsBtn.addEventListener('click', () => {
                onNavigate('/admin/bookings');
            });
        }
        
        // View reports button
        const viewReportsBtn = container.querySelector('#view-reports-btn');
        if (viewReportsBtn) {
            viewReportsBtn.addEventListener('click', () => {
                showReportsModal();
            });
        }
        
        // System settings button
        const systemSettingsBtn = container.querySelector('#system-settings-btn');
        if (systemSettingsBtn) {
            systemSettingsBtn.addEventListener('click', () => {
                showSystemSettingsModal();
            });
        }
        
        // Refresh activity button
        const refreshActivityBtn = container.querySelector('#refresh-activity');
        if (refreshActivityBtn) {
            refreshActivityBtn.addEventListener('click', () => {
                loadDashboardData();
            });
        }
        
        // View toggle buttons
        const viewToggleBtns = container.querySelectorAll('.view-toggle-btn');
        viewToggleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                
                // Update active button
                viewToggleBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update utilization display
                updateCourtUtilization(view);
            });
        });
    };
    
    // Load dashboard data
    const loadDashboardData = async () => {
        if (isLoading) return;
        
        isLoading = true;
        
        try {
            // Load admin dashboard data
            const response = await store.api.admin.getDashboardData();
            dashboardData = response.data;
            
            // Update statistics
            updateStatistics();
            
            // Render recent activity
            renderRecentActivity();
            
            // Render court utilization
            updateCourtUtilization('paddle');
            
        } catch (error) {
            console.error('Error loading admin dashboard data:', error);
            
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
        if (!dashboardData) return;
        
        const todayBookings = container.querySelector('#today-bookings');
        const totalUsers = container.querySelector('#total-users');
        const activeBookings = container.querySelector('#active-bookings');
        const revenueToday = container.querySelector('#revenue-today');
        
        if (todayBookings) {
            todayBookings.textContent = dashboardData.summary?.todayBookings || 0;
        }
        
        if (totalUsers) {
            totalUsers.textContent = dashboardData.summary?.totalUsers || 0;
        }
        
        if (activeBookings) {
            activeBookings.textContent = dashboardData.summary?.activeBookings || 0;
        }
        
        if (revenueToday) {
            revenueToday.textContent = `${dashboardData.summary?.revenueToday || 0} EGP`;
        }
    };
    
    // Render recent activity
    const renderRecentActivity = () => {
        const activityList = container.querySelector('#activity-list');
        if (!activityList || !dashboardData) return;
        
        const recentBookings = dashboardData.recentBookings || [];
        
        if (recentBookings.length === 0) {
            activityList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No Recent Activity</h3>
                    <p>No recent bookings found.</p>
                </div>
            `;
            return;
        }
        
        activityList.innerHTML = recentBookings.map(booking => `
            <div class="activity-item">
                <div class="activity-icon ${booking.status}">
                    <i class="fas fa-${booking.courtType === 'paddle' ? 'table-tennis-paddle-ball' : 'baseball'}"></i>
                </div>
                <div class="activity-content">
                    <h4>Court ${booking.courtNumber} Booking</h4>
                    <p>
                        ${booking.user?.fullName || booking.user?.email || 'User'} • 
                        ${formatDate(booking.date, 'short')} at ${formatTimeSlot(booking.timeSlot)}
                    </p>
                    <span class="activity-status ${booking.status}">${booking.status}</span>
                </div>
                <div class="activity-actions">
                    <button class="btn btn-outline btn-sm view-activity" data-id="${booking._id}">
                        View
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to view buttons
        const viewButtons = activityList.querySelectorAll('.view-activity');
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const bookingId = e.target.dataset.id;
                viewBookingDetails(bookingId);
            });
        });
    };
    
    // Update court utilization
    const updateCourtUtilization = (view) => {
        const utilizationGrid = container.querySelector('#utilization-grid');
        if (!utilizationGrid || !dashboardData) return;
        
        const courtUtilization = dashboardData.courtUtilization || [];
        
        // Filter courts based on view
        let courts = [];
        
        if (view === 'paddle') {
            courts = courtUtilization.filter(court => court._id === 'paddle');
        } else if (view === 'tennis') {
            courts = courtUtilization.filter(court => court._id === 'tennis');
        } else {
            courts = courtUtilization;
        }
        
        if (courts.length === 0) {
            utilizationGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-pie"></i>
                    <h3>No Utilization Data</h3>
                    <p>No court utilization data available.</p>
                </div>
            `;
            return;
        }
        
        utilizationGrid.innerHTML = courts.map(court => `
            <div class="utilization-card">
                <div class="utilization-header">
                    <h3>${court._id === 'paddle' ? 'Paddle Courts' : 'Tennis Courts'}</h3>
                    <span class="utilization-percentage">${calculateUtilizationPercentage(court.count, court._id)}%</span>
                </div>
                <div class="utilization-bar">
                    <div class="utilization-fill" style="width: ${calculateUtilizationPercentage(court.count, court._id)}%"></div>
                </div>
                <div class="utilization-stats">
                    <div class="stat">
                        <span class="stat-label">Active Bookings:</span>
                        <span class="stat-value">${court.count || 0}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Total Courts:</span>
                        <span class="stat-value">${court._id === 'paddle' ? 2 : 3}</span>
                    </div>
                </div>
            </div>
        `).join('');
    };
    
    // Calculate utilization percentage
    const calculateUtilizationPercentage = (count, courtType) => {
        const totalCourts = courtType === 'paddle' ? 2 : 3;
        const maxBookingsPerCourt = 14; // 8 AM to 10 PM = 14 hours
        
        // Calculate percentage based on bookings vs maximum possible bookings
        const maxPossibleBookings = totalCourts * maxBookingsPerCourt;
        const percentage = (count / maxPossibleBookings) * 100;
        
        return Math.min(100, Math.round(percentage));
    };
    
    // View booking details
    const viewBookingDetails = (bookingId) => {
        // Navigate to booking management with filter for this booking
        onNavigate(`/admin/bookings?bookingId=${bookingId}`);
    };
    
    // Show reports modal
    const showReportsModal = () => {
        if (onShowNotification) {
            onShowNotification({
                type: 'info',
                title: 'Reports',
                message: 'Revenue and booking reports are available in the booking management section.',
                duration: 5000
            });
        }
    };
    
    // Show system settings modal
    const showSystemSettingsModal = () => {
        if (onShowNotification) {
            onShowNotification({
                type: 'info',
                title: 'System Settings',
                message: 'System settings can be configured by contacting the system administrator.',
                duration: 5000
            });
        }
    };
    
    return {
        render,
        init
    };
}