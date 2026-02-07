import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const MyBookings = ({ user }) => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Fetch Logic wrapped in useCallback to prevent unnecessary re-renders
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
            console.error('MyBookings Error:', err);
            setError('Unable to connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    // 2. Lifecycle: Fetch on mount
    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // 3. Helper to format dates
    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-GB', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="my-bookings-container">
            <div className="booking-header">
                <h2>My Bookings</h2>
                {user ? (
                    <p>Viewing reservations for <strong>{user.email}</strong></p>
                ) : (
                    <div className="auth-alert">
                        <p>Please login to view your reservations.</p>
                        <Link to="/login" className="btn btn-primary">Login Now</Link>
                    </div>
                )}
            </div>

            {loading && <p className="loading">Fetching your bookings...</p>}
            
            {error && <p className="error-text">{error}</p>}

            {!loading && user && (
                <div className="booking-list">
                    {bookings.length > 0 ? (
                        bookings.map((b) => (
                            <div key={b._id} className={`booking-card ${b.status === 'cancelled' ? 'cancelled' : ''}`}>
                                <div className="booking-details">
                                    <span className={`court-badge badge-${b.courtType}`}>
                                        {b.courtType.toUpperCase()}
                                    </span>
                                    <strong>Court {b.courtNumber}</strong>
                                    <p className="booking-time">
                                        📅 {formatDate(b.date)}<br />
                                        ⏰ {b.timeSlot} ({b.duration} Hour{b.duration > 1 ? 's' : ''})
                                    </p>
                                </div>
                                <div className="booking-meta">
                                    <span className={`status-badge status-${b.status}`}>
                                        {b.status.toUpperCase()}
                                    </span>
                                    <p className="booking-price">{b.totalPrice} EGP</p>
                                    {b.paymentStatus === 'pending' && (
                                        <span className="payment-warning">⚠️ Payment Pending</span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <p>No bookings found. Ready to hit the court?</p>
                            <button onClick={() => navigate('/booking')} className="btn btn-primary">
                                Book a Court Now
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyBookings;