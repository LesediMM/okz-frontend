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
                setRecentBookings(res.data.bookings.slice(0, 3));
            }
        } catch (error) {
            console.error('Dashboard Activity Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="dashboard-container apple-fade-in">
            {/* --- Branded Header --- */}
            <header className="dashboard-header">
                <div className="greeting-group">
                    <span className="date-label">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    <h1 className="hero-title">Hello, {user.fullName.split(' ')[0]}</h1>
                </div>
                <div className="user-avatar-circle" style={{ background: 'var(--brand-navy)' }}>
                    {user.fullName.charAt(0)}
                </div>
            </header>

            <div className="dashboard-grid">
                {/* --- Quick Action: Reserve (Primary) --- */}
                <div className="glass-panel dashboard-card primary-action">
                    <div className="widget-icon-bg" style={{ background: 'rgba(26, 43, 86, 0.1)' }}>🎾</div>
                    <div className="card-content">
                        <h3>Start a Game</h3>
                        <p className="text-muted">Book a professional court instantly.</p>
                    </div>
                    <button onClick={() => navigate('/booking')} className="btn-primary" style={{ width: '100%', marginTop: 'auto' }}>
                        Book Now
                    </button>
                </div>

                {/* --- Recent Activity: Activity Feed --- */}
                <div className="glass-panel dashboard-card activity-feed">
                    <div className="widget-header">
                        <h3>Recent Activity</h3>
                        <Link to="/my-bookings" className="apple-link-small">See All</Link>
                    </div>

                    {loading ? (
                        <div className="loader-container">Loading...</div>
                    ) : recentBookings.length > 0 ? (
                        <div className="mini-activity-list">
                            {recentBookings.map((b, index) => (
                                <div key={b._id || index} className="activity-row">
                                    <div className={`activity-dot ${b.courtType.toLowerCase()}`}></div>
                                    <div className="activity-info">
                                        <span className="activity-title">{b.courtType} (Court {b.courtNumber})</span>
                                        <span className="activity-time">{new Date(b.date).toLocaleDateString()} • {b.timeSlot}</span>
                                    </div>
                                    <span className={`status-pill status-${b.status.toLowerCase()}`}>{b.status}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p className="text-muted">No games scheduled yet.</p>
                        </div>
                    )}
                </div>

                {/* --- Club Stats: Info Widget --- */}
                <div className="glass-panel dashboard-card info-widget">
                    <div className="widget-icon-bg" style={{ background: 'rgba(52, 199, 89, 0.1)' }}>🏆</div>
                    <h3>Club Rules</h3>
                    <div className="apple-stat-list">
                        <div className="stat-row">
                            <span>Court Rate</span>
                            <strong>400 EGP</strong>
                        </div>
                        <div className="stat-row">
                            <span>Opening</span>
                            <strong>08:00 AM</strong>
                        </div>
                        <div className="stat-row">
                            <span>Closing</span>
                            <strong>10:00 PM</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;