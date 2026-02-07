import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/MyBookings.css'; // Separation of concerns

const MyBookings = ({ user }) => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBookings = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('https://okz.onrender.com/api/v1/bookings', {
                method: 'GET',
                headers: {
                    'x-user-email': user.email,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                setBookings(result.data.bookings || []);
            } else {
                setError(result.message || 'Failed to load bookings.');
            }
        } catch (err) {
            setError('Unable to connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="bookings-page-container apple-fade-in">
            <header className="page-header">
                <Link to="/dashboard" className="back-link">← Dashboard</Link>
                <h1 className="hero-title">My Reservations</h1>
                <p className="text-muted">Manage your schedule and history.</p>
            </header>

            {loading && (
                <div className="loader-container">
                    <p className="loading-text">Refreshing court data...</p>
                </div>
            )}
            
            {error && <div className="glass-panel error-alert">{error}</div>}

            {!loading && user && (
                <div className="bookings-stack">
                    {bookings.length > 0 ? (
                        bookings.map((b) => (
                            <div key={b._id} className={`glass-panel ticket-card ${b.status === 'cancelled' ? 'ticket-cancelled' : ''}`}>
                                <div className="ticket-main">
                                    <div className="sport-tag">
                                        <span className={`status-dot ${b.courtType.toLowerCase()}`}></span>
                                        {b.courtType.toUpperCase()}
                                    </div>
                                    <h3 className="court-title">Court {b.courtNumber}</h3>
                                    <div className="ticket-details">
                                        <div className="detail-item">
                                            <span className="label">DATE</span>
                                            <span className="val">{formatDate(b.date)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="label">TIME</span>
                                            <span className="val">{b.timeSlot}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="ticket-divider"></div>

                                <div className="ticket-stub">
                                    <span className={`status-pill status-${b.status.toLowerCase()}`}>
                                        {b.status}
                                    </span>
                                    <div className="price-tag">{b.totalPrice} EGP</div>
                                    {b.paymentStatus === 'pending' && b.status !== 'cancelled' && (
                                        <span className="pay-warning">Unpaid</span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="glass-panel empty-state">
                            <div className="empty-icon">🎾</div>
                            <h3>No sessions yet</h3>
                            <p>Your reserved courts will appear here as tickets.</p>
                            <button onClick={() => navigate('/booking')} className="btn-primary" style={{marginTop: '20px'}}>
                                Find a Court
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyBookings;