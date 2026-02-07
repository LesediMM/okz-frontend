/**
 * src/pages/AdminDashboard.js
 * Admin Oversight & Business Analytics - Simplified (No external API imports)
 */

export default {
    /**
     * Render the Admin Dashboard Shell
     */
    render: async () => {
        // Checking for the same token used in the app, 
        // ensuring user has at least logged in before seeing the shell
        const token = localStorage.getItem('accessToken');
        if (!token) {
            window.location.hash = '#/login';
            return '';
        }

        return `
            <div class="admin-dashboard">
                <header class="admin-header">
                    <h1>Admin Control Panel</h1>
                    <div class="admin-actions">
                        <a href="#/my-bookings" class="btn">User View</a>
                        <button id="refresh-stats" class="btn btn-primary">Refresh Data</button>
                    </div>
                </header>

                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="stat-label">Total Bookings</span>
                        <h2 id="total-bookings">--</h2>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">Estimated Revenue</span>
                        <h2 id="total-revenue">-- EGP</h2>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">Active Users</span>
                        <h2 id="total-users">--</h2>
                    </div>
                    <div class="stat-card">
                        <span class="stat-label">Court Utilization</span>
                        <h2 id="utilization">--%</h2>
                    </div>
                </div>

                <div class="admin-content-grid">
                    <div class="card table-card">
                        <h3>Revenue by Court Type</h3>
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>Court Type</th>
                                    <th>Bookings</th>
                                    <th>Estimated Earnings</th>
                                </tr>
                            </thead>
                            <tbody id="revenue-table-body">
                                <tr><td colspan="3">Loading statistics...</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="card health-card">
                        <h3>System Status</h3>
                        <div id="system-health-status">
                            <p>Checking backend connectivity...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Fetch and populate administrative data
     */
    afterRender: async () => {
        const refreshBtn = document.getElementById('refresh-stats');
        const token = localStorage.getItem('accessToken');
        
        const loadDashboardData = async () => {
            try {
                // Fetch directly from the backend admin endpoint
                const response = await fetch('https://okz.onrender.com/api/v1/bookings', {
                    method: 'GET',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const res = await response.json();

                if (response.ok && res.status === 'success') {
                    const bookings = res.data.bookings;
                    
                    // Simple logic to calculate stats from the bookings array
                    const totalBookings = bookings.length;
                    const revenue = totalBookings * 400;
                    const paddleCount = bookings.filter(b => b.courtNumber <= 2).length;
                    const tennisCount = bookings.filter(b => b.courtNumber > 2).length;

                    // Update UI
                    document.getElementById('total-bookings').textContent = totalBookings;
                    document.getElementById('total-revenue').textContent = `${revenue} EGP`;
                    document.getElementById('total-users').textContent = 'Live'; // Backend doesn't return user count yet
                    document.getElementById('utilization').textContent = `${Math.round((totalBookings / 70) * 100)}%`;

                    document.getElementById('revenue-table-body').innerHTML = `
                        <tr>
                            <td>Paddle (Courts 1-2)</td>
                            <td>${paddleCount}</td>
                            <td>${paddleCount * 400} EGP</td>
                        </tr>
                        <tr>
                            <td>Tennis (Courts 3-5)</td>
                            <td>${tennisCount}</td>
                            <td>${tennisCount * 400} EGP</td>
                        </tr>
                    `;

                    document.getElementById('system-health-status').innerHTML = `
                        <div class="health-item">
                            <span>API Status:</span> <span class="status-badge status-confirmed">Operational</span>
                        </div>
                        <div class="health-item">
                            <span>Database:</span> <span class="status-badge status-confirmed">Connected</span>
                        </div>
                    `;
                } else {
                    alert('Admin access required or session expired.');
                }
            } catch (error) {
                console.error('Admin Load Error:', error);
                document.getElementById('revenue-table-body').innerHTML = `<tr><td colspan="3">Error loading data</td></tr>`;
            }
        };

        if (refreshBtn) refreshBtn.addEventListener('click', loadDashboardData);
        await loadDashboardData();
    }
};