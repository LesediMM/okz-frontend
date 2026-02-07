import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const UserDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Security Check: If no user is in memory, send them to login
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchDashboardData();
    }, [user, navigate]);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('https://okz.onrender.com/api/v1/bookings', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': user.email // Using email from RAM
                }
            });

            const res = await response.json();

            if (response.ok && res.status === 'success') {
                // Take only the 3 most recent
                setRecentBookings(res.data.bookings.slice(0, 3));
            }
        } catch (error) {
            console.error('Dashboard Activity Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null; // Prevent flash of empty content during redirect

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <h1>Welcome back, {user.fullName.split(' ')[0]}!</h1>
                <p>Manage your sessions and court reservations.</p>
            </header>

            <div className="dashboard-grid">
                {/* Quick Actions - Always visible */}
                <div className="card action-card">
                    <h3>Quick Actions</h3>
                    <div className="button-stack">
                        <button onClick={() => navigate('/booking')} className="btn btn-primary">
                            Book New Court
                        </button>
                        <button onClick={() => navigate('/my-bookings')} className="btn btn-secondary">
                            View All Bookings
                        </button>
                    </div>
                </div>

                {/* Recent Activity - Fetched Data */}
                <div className="card activity-card">
                    <h3>Recent Activity</h3>
                    {loading ? (
                        <p className="loading-text">Loading your bookings...</p>
                    ) : recentBookings.length > 0 ? (
                        <ul className="mini-booking-list">
                            {recentBookings.map((b, index) => (
                                <li key={b._id || index}>
                                    <strong>{b.courtType.toUpperCase()} (Court {b.courtNumber})</strong>
                                    <span>{new Date(b.date).toLocaleDateString()} at {b.timeSlot}</span>
                                    <span className={`status-badge status-${b.status.toLowerCase()}`}>
                                        {b.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="empty-state">
                            <p>No recent bookings. Ready to play?</p>
                            <Link to="/booking" className="btn-link">Reserve your first court →</Link>
                        </div>
                    )}
                </div>

                {/* Club Info - Responsive Stat Cards */}
                <div className="card info-card">
                    <h3>Club Info</h3>
                    <div className="info-stats">
                        <div className="stat-item">
                            <strong>Rate:</strong> 400 EGP / Hr
                        </div>
                        <div className="stat-item">
                            <strong>Hours:</strong> 08:00 - 22:00
                        </div>
                        <div className="stat-item">
                            <strong>Location:</strong> Main Sports Hub
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;