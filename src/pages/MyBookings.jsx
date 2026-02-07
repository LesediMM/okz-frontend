import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/MyBookings.css'; 

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
            <header className="page-header" style={{ marginBottom: '2.5rem' }}>
                <Link to="/dashboard" className="see-all-btn" style={{ textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
                    ← Dashboard
                </Link>
                <h1 className="hero-title" style={{ fontSize: '2.5rem' }}>My Reservations</h1>
                <p className="text-muted">Manage your schedule and match history.</p>
            </header>

            {loading && (
                <div className="loader-container" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p className="text-muted">Fetching your tickets...</p>
                </div>
            )}
            
            {error && <div className="glass-panel" style={{ padding: '20px', color: 'var(--system-red)', textAlign: 'center' }}>{error}</div>}

            {!loading && user && (
                <div className="bookings-stack">
                    {bookings.length > 0 ? (
                        bookings.map((b) => (
                            <div key={b._id} className={`glass-panel ticket-card ${b.status === 'cancelled' ? 'ticket-cancelled' : ''}`}>
                                {/* Main part of the ticket */}
                                <div className="ticket-main">
                                    <div className="sport-tag" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                        <div className={`status-pill`} style={{ fontSize: '0.6rem', padding: '2px 8px' }}>
                                            {b.courtType.toUpperCase()}
                                        </div>
                                    </div>
                                    <h3 className="court-title">Court {b.courtNumber}</h3>
                                    <div className="ticket-details" style={{ display: 'flex', gap: '24px', marginTop: 'auto' }}>
                                        <div className="detail-item">
                                            <span className="date-label" style={{ display: 'block', fontSize: '0.65rem' }}>DATE</span>
                                            <span style={{ fontWeight: '700', color: 'var(--brand-navy)' }}>{formatDate(b.date)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="date-label" style={{ display: 'block', fontSize: '0.65rem' }}>TIME</span>
                                            <span style={{ fontWeight: '700', color: 'var(--brand-navy)' }}>{b.timeSlot}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* The "Perforation" line styled in MyBookings.css */}
                                <div className="ticket-divider"></div>

                                {/* The Stub / Price & Status section */}
                                <div className="ticket-stub">
                                    <span className={`status-pill`}>
                                        {b.status}
                                    </span>
                                    <div className="price-tag">{b.totalPrice || (b.duration * 400)} EGP</div>
                                    {b.paymentStatus === 'pending' && b.status !== 'cancelled' && (
                                        <span style={{ fontSize: '0.65rem', color: 'var(--system-red)', fontWeight: '800', marginTop: '5px' }}>
                                            UNPAID
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="glass-panel empty-state" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎾</div>
                            <h3>No sessions yet</h3>
                            <p className="text-muted">Your reserved courts will appear here as tickets.</p>
                            <button onClick={() => navigate('/booking')} className="book-now-btn" style={{ maxWidth: '200px', margin: '20px auto' }}>
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