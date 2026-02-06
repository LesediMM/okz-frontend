/**
 * src/pages/AdminBookings.js
 * Comprehensive Booking Management for Admins
 */

import { request } from '../api/index.js';

export default {
    render: async () => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            window.location.hash = '#/admin/login';
            return '';
        }

        return `
            <div class="admin-bookings-page">
                <header class="admin-view-header">
                    <h1>Global Bookings Manager</h1>
                    <div class="filter-bar">
                        <select id="filter-status">
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending Payment</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <button id="refresh-list" class="btn btn-primary">Refresh List</button>
                    </div>
                </header>

                <div class="card table-card">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Date/Time</th>
                                <th>User</th>
                                <th>Court</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="admin-bookings-body">
                            <tr><td colspan="7">Fetching all reservations...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    afterRender: async () => {
        const statusFilter = document.getElementById('filter-status');
        const refreshBtn = document.getElementById('refresh-list');
        const tableBody = document.getElementById('admin-bookings-body');

        const fetchAllBookings = async () => {
            try {
                // Backend endpoint for admin history
                const res = await request('/admin/bookings/history', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
                });

                if (res.status === 'success') {
                    renderTable(res.data.bookings);
                }
            } catch (error) {
                tableBody.innerHTML = `<tr><td colspan="7" class="error">Failed to load system bookings.</td></tr>`;
            }
        };

        const renderTable = (bookings) => {
            const filter = statusFilter.value;
            const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

            if (filtered.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="7">No bookings found for this filter.</td></tr>`;
                return;
            }

            tableBody.innerHTML = filtered.map(b => `
                <tr>
                    <td>
                        <div class="date-cell">
                            <strong>${b.date}</strong>
                            <span>${b.timeSlot}</span>
                        </div>
                    </td>
                    <td>${b.userEmail || 'Guest'}</td>
                    <td>Court ${b.courtNumber}</td>
                    <td><span class="type-tag ${b.courtType}">${b.courtType}</span></td>
                    <td><span class="status-badge status-${b.status}">${b.status}</span></td>
                    <td>400 EGP</td>
                    <td>
                        <button class="btn-sm" onclick="alert('Manage Booking ${b._id}')">Details</button>
                    </td>
                </tr>
            `).join('');
        };

        statusFilter.addEventListener('change', fetchAllBookings);
        refreshBtn.addEventListener('click', fetchAllBookings);
        
        // Initial Load
        await fetchAllBookings();
    }
};