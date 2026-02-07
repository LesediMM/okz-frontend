import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Dashboard.css';

const UserDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);

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
                    'x-user-email': user.email
                }
            });
            const res = await response.json();
            if (response.ok && res.status === 'success') {
                // Keep only the 3 most recent bookings for the mini-feed
                setRecentBookings(res.data.bookings.slice(0, 3));
            }
        } catch (error) {
            console.error('Dashboard Activity Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    // Format greeting name (first name only)
    const firstName = user.fullName ? user.fullName.split(' ')[0] : 'Player';

    return (
        <div className="dashboard-container apple-fade-in">
            {/* --- Branded Header --- */}
            <header className="dashboard-header">
                <div className="greeting-group">
                    <span className="date-label">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                    <h1 className="hero-title">Hello, {firstName}</h1>
                </div>
                <div className="nav-profile-circle">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
            </header>

            

            <div className="dashboard-grid">
                {/* --- Quick Action: Reserve (Primary) --- */}
                <div className="glass-panel dashboard-card">
                    <div className="widget-icon-bg" style={{ background: 'rgba(26, 43, 86, 0.08)' }}>🎾</div>
                    <div className="card-content">
                        <h3>Start a Game</h3>
                        <p className="text-muted">Book a professional court instantly.</p>
                    </div>
                    <button onClick={() => navigate('/booking')} className="book-now-btn">
                        Book Now
                    </button>
                </div>

                {/* --- Recent Activity: Activity Feed --- */}
                <div className="glass-panel dashboard-card">
                    <div className="dashboard-header" style={{ marginBottom: '1.5rem', padding: 0 }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Recent Activity</h3>
                        <Link to="/my-bookings" className="see-all-btn">See All</Link>
                    </div>

                    {loading ? (
                        <div className="loader-container">Fetching matches...</div>
                    ) : recentBookings.length > 0 ? (
                        <div className="mini-activity-list">
                            {recentBookings.map((b, index) => (
                                <div key={b._id || index} className="activity-row">
                                    <div className="activity-info">
                                        <span className="activity-title">
                                            {b.courtType.charAt(0).toUpperCase() + b.courtType.slice(1)} (C{b.courtNumber})
                                        </span>
                                        <span className="activity-time">
                                            {new Date(b.date).toLocaleDateString()} • {b.timeSlot}
                                        </span>
                                    </div>
                                    <span className="status-pill">{b.status}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <p className="text-muted">No games scheduled yet.</p>
                        </div>
                    )}
                </div>

                {/* --- Club Stats: Info Widget --- */}
                <div className="glass-panel dashboard-card">
                    <div className="widget-icon-bg" style={{ background: 'rgba(52, 199, 89, 0.1)' }}>🏆</div>
                    <h3 style={{ marginBottom: '1rem' }}>Club Rules</h3>
                    <div className="apple-stat-list">
                        <div className="stat-row">
                            <span>Court Rate</span>
                            <strong>400 EGP/hr</strong>
                        </div>
                        <div className="stat-row">
                            <span>Opening</span>
                            <strong>08:00 AM</strong>
                        </div>
                        <div className="stat-row">
                            <span>Closing</span>
                            <strong>10:00 PM</strong>
                        </div>
                        <div className="stat-row" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>Cairo, Egypt</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;