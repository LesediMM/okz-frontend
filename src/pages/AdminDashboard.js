/**
 * src/pages/AdminDashboard.js
 * Admin Oversight & Business Analytics
 */

import { request } from '../api/index.js';

export default {
    /**
     * Render the Admin Dashboard Shell
     */
    render: async () => {
        // Note: In a production app, you'd check for admin-specific tokens here
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            window.location.hash = '#/admin/login';
            return '';
        }

        return `
            <div class="admin-dashboard">
                <header class="admin-header">
                    <h1>Admin Control Panel</h1>
                    <div class="admin-actions">
                        <a href="#/admin/bookings" class="btn">Manage All Bookings</a>
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
        
        const loadDashboardData = async () => {
            try {
                // Fetch stats from Admin Dashboard Endpoint
                const res = await request('/admin/dashboard', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
                });

                if (res.status === 'success') {
                    const stats = res.data.statistics;
                    const config = res.data.config;

                    // Update Hero Stats
                    document.getElementById('total-bookings').textContent = stats.totalBookings;
                    document.getElementById('total-revenue').textContent = `${stats.totalBookings * config.pricePerHour} EGP`;
                    document.getElementById('total-users').textContent = stats.totalUsers || '0';
                    document.getElementById('utilization').textContent = `${Math.round((stats.totalBookings / (14 * 5)) * 100)}%`;

                    // Update Table
                    const paddleBookings = stats.breakdown?.paddle || 0;
                    const tennisBookings = stats.breakdown?.tennis || 0;

                    document.getElementById('revenue-table-body').innerHTML = `
                        <tr>
                            <td>Paddle (Courts 1-2)</td>
                            <td>${paddleBookings}</td>
                            <td>${paddleBookings * 400} EGP</td>
                        </tr>
                        <tr>
                            <td>Tennis (Courts 3-5)</td>
                            <td>${tennisBookings}</td>
                            <td>${tennisBookings * 400} EGP</td>
                        </tr>
                    `;

                    // System Health
                    document.getElementById('system-health-status').innerHTML = `
                        <div class="health-item">
                            <span>API Status:</span> <span class="status-badge status-confirmed">Operational</span>
                        </div>
                        <div class="health-item">
                            <span>Database:</span> <span class="status-badge status-confirmed">Connected</span>
                        </div>
                        <p class="small">Last Updated: ${new Date(res.data.config.serverTime).toLocaleTimeString()}</p>
                    `;
                }
            } catch (error) {
                console.error('Admin Load Error:', error);
                alert('Failed to load dashboard data. Please check admin permissions.');
            }
        };

        refreshBtn.addEventListener('click', loadDashboardData);
        await loadDashboardData();
    }
};