import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
        <div className="dashboard-page apple-fade-in">
            {/* --- Apple Header --- */}
            <header className="dashboard-header">
                <div className="greeting-group">
                    <span className="date-label">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    <h1>Hello, {user.fullName.split(' ')[0]}</h1>
                </div>
                <div className="user-avatar-circle">{user.fullName.charAt(0)}</div>
            </header>

            <div className="apple-bento-grid">
                {/* --- Quick Action Widget --- */}
                <div className="card glass-card bento-item primary-action">
                    <div className="widget-icon-bg icon-blue">🎾</div>
                    <h3>Start a Game</h3>
                    <p className="text-muted">Book a professional Padel or Tennis court instantly.</p>
                    <button onClick={() => navigate('/booking')} className="btn btn-primary btn-full">
                        Book Now
                    </button>
                </div>

                {/* --- Activity Widget --- */}
                <div className="card glass-card bento-item activity-widget">
                    <div className="widget-header">
                        <h3>Recent Activity</h3>
                        <Link to="/my-bookings" className="apple-link-small">See All</Link>
                    </div>

                    {loading ? (
                        <div className="loader-container"><div className="loader"></div></div>
                    ) : recentBookings.length > 0 ? (
                        <div className="mini-activity-list">
                            {recentBookings.map((b, index) => (
                                <div key={b._id || index} className="activity-row">
                                    <div className={`activity-dot ${b.courtType}`}></div>
                                    <div className="activity-info">
                                        <span className="activity-title">{b.courtType.toUpperCase()} (Court {b.courtNumber})</span>
                                        <span className="activity-time">{new Date(b.date).toLocaleDateString()} • {b.timeSlot}</span>
                                    </div>
                                    <span className={`apple-badge status-${b.status.toLowerCase()}`}>{b.status}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No games scheduled yet.</p>
                        </div>
                    )}
                </div>

                {/* --- Stats/Club Widget --- */}
                <div className="card glass-card bento-item info-widget">
                    <div className="widget-icon-bg icon-green">🏆</div>
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

            <style>{`
                .dashboard-page {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 2rem 1rem;
                }

                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 3rem;
                }

                .date-label {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: var(--system-gray);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .dashboard-header h1 {
                    font-size: 2.2rem;
                    font-weight: 800;
                    letter-spacing: -1px;
                }

                .user-avatar-circle {
                    width: 50px;
                    height: 50px;
                    background: var(--system-gray);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    font-weight: 700;
                    font-size: 1.2rem;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                /* Bento Grid Layout */
                .apple-bento-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    grid-template-rows: auto;
                    gap: 20px;
                }

                .activity-widget { grid-column: span 2; }

                @media (min-width: 900px) {
                    .apple-bento-grid {
                        grid-template-columns: 1.2fr 2fr 1fr;
                    }
                    .activity-widget { grid-column: span 1; }
                }

                .bento-item {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                /* Widget Elements */
                .widget-icon-bg {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    margin-bottom: 1.5rem;
                }
                .icon-blue { background: rgba(0, 122, 255, 0.1); color: var(--system-blue); }
                .icon-green { background: rgba(52, 199, 89, 0.1); color: var(--system-green); }

                .widget-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .apple-link-small {
                    color: var(--system-blue);
                    font-size: 0.9rem;
                    font-weight: 600;
                    text-decoration: none;
                }

                /* Activity List Styles */
                .activity-row {
                    display: flex;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 0.5px solid rgba(0,0,0,0.05);
                }
                .activity-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    margin-right: 12px;
                }
                .activity-dot.tennis { background: var(--system-blue); }
                .activity-dot.padel { background: var(--system-green); }

                .activity-info { flex: 1; display: flex; flex-direction: column; }
                .activity-title { font-weight: 600; font-size: 0.95rem; }
                .activity-time { font-size: 0.8rem; color: var(--text-muted); }

                .apple-badge {
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 4px 10px;
                    border-radius: 100px;
                    text-transform: uppercase;
                }
                .status-confirmed { background: rgba(52, 199, 89, 0.15); color: #248a3d; }
                .status-pending { background: rgba(255, 149, 0, 0.15); color: #c97b00; }

                /* Stats Widget */
                .apple-stat-list { display: flex; flex-direction: column; gap: 15px; margin-top: 1rem; }
                .stat-row { display: flex; justify-content: space-between; font-size: 0.9rem; }
                .stat-row span { color: var(--text-muted); }

                .btn-full { width: 100%; margin-top: 1rem; }
            `}</style>
        </div>
    );
};

export default UserDashboard;