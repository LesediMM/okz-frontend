import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Dashboard.css';

const UserDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // FIX 1: Changed 'paddle' to 'padel' in initial state
    const [pricing, setPricing] = useState({
        padel: 400,
        tennis: 150
    });

    useEffect(() => {
        // Defensive: Wait for auth state to settle before forcing redirect
        if (!user) {
            const authTimeout = setTimeout(() => {
                if (!user) navigate('/login');
            }, 800);
            return () => clearTimeout(authTimeout);
        }
        fetchDashboardData();
    }, [user, navigate]);

    const fetchDashboardData = async () => {
        // Guard against calling API without a valid user email
        if (!user?.email) return;

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
                // Null-safe access to the nested data structure
                const bookings = res?.data?.bookings || [];
                setRecentBookings(bookings.slice(0, 3));
            }

            // FIX 2: Updated API fetch logic to handle both 'padel' and 'paddle' for backward compatibility
            const statusResponse = await fetch('https://okz.onrender.com/api/status');
            const statusData = await statusResponse.json();
            if (statusData?.system?.pricing) {
                setPricing({
                    // Map the backend 'padel' field (with fallback to 'paddle' for backward compatibility)
                    padel: parseInt(statusData.system.pricing.padel || statusData.system.pricing.paddle) || 400,
                    tennis: parseInt(statusData.system.pricing.tennis) || 150
                });
            }
        } catch (error) {
            console.error('Dashboard Activity Error:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Safe Property Access Logic
     * Prevents "Cannot read property of null" during the render cycle.
     */
    const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Player';
    const userInitial = user?.fullName?.charAt(0).toUpperCase() || 'U';
    const today = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
    });

    // Format price display
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-EG', {
            style: 'currency',
            currency: 'EGP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    // If user is null, show a graceful loading state instead of crashing
    if (!user) {
        return (
            <div className="loader-container apple-fade-in" style={{ textAlign: 'center', marginTop: '20vh' }}>
                <div className="loader"></div>
                <p className="text-muted">Authenticating session...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container apple-fade-in">
            {/* --- Branded Header --- */}
            <header className="dashboard-header">
                <div className="greeting-group">
                    <span className="date-label">{today}</span>
                    <h1 className="hero-title">Hello, {firstName}</h1>
                </div>
                <div className="nav-profile-circle">
                    {userInitial}
                </div>
            </header>

            <div className="dashboard-grid">
                {/* --- Quick Action: Reserve (Primary) --- */}
                <div className="glass-panel dashboard-card">
                    <div className="widget-icon-bg" style={{ background: 'rgba(26, 43, 86, 0.08)' }}>🎾</div>
                    <div className="card-content">
                        <h3>Start a Game</h3>
                        <p className="text-muted">Book a professional court instantly.</p>
                        <div className="price-tag" style={{ 
                            background: 'rgba(0,0,0,0.03)', 
                            padding: '8px 12px', 
                            borderRadius: '20px',
                            display: 'inline-block',
                            marginTop: '8px',
                            fontSize: '0.85rem'
                        }}>
                            <span style={{ marginRight: '15px' }}>🎾 Tennis: {formatPrice(pricing.tennis)}/hr</span>
                            {/* FIX 3A: Changed 'pricing.paddle' to 'pricing.padel' */}
                            <span>🏸 Padel: {formatPrice(pricing.padel)}/hr</span>
                        </div>
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
                                <div key={b?._id || index} className="activity-row">
                                    <div className="activity-info">
                                        <span className="activity-title">
                                            {/* Safe access to court properties */}
                                            {(b?.courtType || 'Court').charAt(0).toUpperCase() + (b?.courtType || '').slice(1)} Court {b?.courtNumber || '?'}
                                            {b?.duration > 1 && <span style={{ fontSize: '0.7rem', marginLeft: '5px', opacity: 0.7 }}>{b.duration}h</span>}
                                        </span>
                                        <span className="activity-time">
                                            {b?.date ? new Date(b.date).toLocaleDateString('en-GB') : 'Pending'} • {b?.timeSlot || '--:--'}
                                            {b?.totalPrice && <span style={{ marginLeft: '8px', fontWeight: '600' }}>{formatPrice(b.totalPrice)}</span>}
                                        </span>
                                    </div>
                                    <span className={`status-pill status-${(b?.status || 'pending').toLowerCase()}`}>
                                        {b?.status || 'Processing'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <p className="text-muted">No games scheduled yet.</p>
                            <button 
                                onClick={() => navigate('/booking')} 
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#0066CC',
                                    marginTop: '10px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Book your first game →
                            </button>
                        </div>
                    )}
                </div>

                {/* --- Club Stats: Info Widget --- */}
                <div className="glass-panel dashboard-card">
                    <div className="widget-icon-bg" style={{ background: 'rgba(52, 199, 89, 0.1)' }}>🏆</div>
                    <h3 style={{ marginBottom: '1rem' }}>Club Rules & Rates</h3>
                    <div className="apple-stat-list">
                        <div className="stat-row">
                            <span>🎾 Tennis Rate</span>
                            <strong>{formatPrice(pricing.tennis)}/hr</strong>
                        </div>
                        {/* FIX 3B: Changed 'pricing.paddle' to 'pricing.padel' */}
                        <div className="stat-row">
                            <span>🏸 Padel Rate</span>
                            <strong>{formatPrice(pricing.padel)}/hr</strong>
                        </div>
                        <div className="stat-row" style={{ borderTop: '1px solid rgba(0,0,0,0.05)', marginTop: '5px', paddingTop: '10px' }}>
                            <span>⏰ Booking Slots</span>
                            <strong>Full Hours Only</strong>
                        </div>
                        <div className="stat-row">
                            <span>🕒 Opening</span>
                            <strong>08:00 AM</strong>
                        </div>
                        <div className="stat-row">
                            <span>🕒 Closing</span>
                            <strong>10:00 PM</strong>
                        </div>
                        <div className="stat-row" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>📍 Cairo, Egypt</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;