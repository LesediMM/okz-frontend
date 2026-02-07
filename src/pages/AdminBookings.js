/**
 * src/pages/AdminBookings.js
 * Comprehensive Booking Management for Admins
 * (Simplified: No external API imports)
 */

export default {
    render: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            window.location.hash = '#/login';
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
        const token = localStorage.getItem('accessToken');

        const fetchAllBookings = async () => {
            try {
                // Fetch directly from your backend admin endpoint
                const response = await fetch('https://okz.onrender.com/api/v1/bookings', {
                    method: 'GET',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const res = await response.json();

                if (response.ok && res.status === 'success') {
                    renderTable(res.data.bookings);
                } else {
                    throw new Error(res.message);
                }
            } catch (error) {
                console.error('Admin Fetch Error:', error);
                tableBody.innerHTML = `<tr><td colspan="7" class="error">Failed to load system bookings. Check admin permissions.</td></tr>`;
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
                            <strong>${new Date(b.date).toLocaleDateString()}</strong>
                            <span>${b.timeSlot}</span>
                        </div>
                    </td>
                    <td>${b.user?.email || 'N/A'}</td>
                    <td>Court ${b.courtNumber}</td>
                    <td><span class="type-tag">${b.courtNumber <= 2 ? 'Paddle' : 'Tennis'}</span></td>
                    <td><span class="status-badge status-${b.status}">${b.status.toUpperCase()}</span></td>
                    <td>${b.price * b.duration} EGP</td>
                    <td>
                        <button class="btn-sm" onclick="alert('Managing Booking: ${b._id}')">View</button>
                    </td>
                </tr>
            `).join('');
        };

        statusFilter.addEventListener('change', () => fetchAllBookings());
        refreshBtn.addEventListener('click', fetchAllBookings);
        
        // Initial Load
        await fetchAllBookings();
    }
};