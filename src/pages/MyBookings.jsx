import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/MyBookings.css'; 

const MyBookings = ({ user }) => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pricing, setPricing] = useState({
        paddle: 400,
        tennis: 150
    });

    // Fetch pricing info
    useEffect(() => {
        fetchPricing();
    }, []);

    const fetchPricing = async () => {
        try {
            const response = await fetch('https://okz.onrender.com/api/status');
            const data = await response.json();
            if (data?.system?.pricing) {
                setPricing({
                    paddle: parseInt(data.system.pricing.paddle) || 400,
                    tennis: parseInt(data.system.pricing.tennis) || 150
                });
            }
        } catch (error) {
            console.error('Failed to fetch pricing:', error);
        }
    };

    /**
     * ✅ FIX: useCallback dependency set to user?.email 
     * This prevents the infinite loop and ensures we only fetch when we have a user identity.
     */
    const fetchBookings = useCallback(async () => {
        if (!user?.email) {
            // Wait slightly for auth to settle, then stop loading if still no user
            const timeout = setTimeout(() => setLoading(false), 1000);
            return () => clearTimeout(timeout);
        }

        try {
            const response = await fetch('https://okz.onrender.com/api/v1/bookings', {
                method: 'GET',
                headers: {
                    'x-user-email': user.email,
                    'Content-Type': 'application/json'
                }
            });

            // Handle non-JSON responses (e.g., server 500 HTML errors)
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server returned an invalid response. Please try again later.");
            }

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                // ✅ FIX: Null-safe data mapping
                setBookings(result?.data?.bookings || []);
            } else {
                setError(result.message || 'Failed to load bookings.');
            }
        } catch (err) {
            setError(err.message || 'Unable to connect to server. Please check your connection.');
        } finally {
            setLoading(false);
        }
    }, [user?.email]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    /**
     * ✅ FIX: Null-safe date formatting
     */
    const formatDate = (dateString) => {
        if (!dateString) return "TBD";
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return "Invalid Date";
        }
    };

    /**
     * Format price with currency
     */
    const formatPrice = (amount) => {
        return new Intl.NumberFormat('en-EG', {
            style: 'currency',
            currency: 'EGP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    /**
     * Get court type icon
     */
    const getCourtIcon = (courtType) => {
        return courtType?.toLowerCase() === 'paddle' ? '🏸' : '🎾';
    };

    /**
     * Get status color class
     */
    const getStatusClass = (status) => {
        switch(status?.toLowerCase()) {
            case 'active': return 'status-active';
            case 'cancelled': return 'status-cancelled';
            case 'completed': return 'status-completed';
            default: return 'status-pending';
        }
    };

    /**
     * Handle booking cancellation
     */
    const handleCancel = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`https://okz.onrender.com/api/v1/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: {
                    'x-user-email': user.email,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                // Refresh bookings list
                fetchBookings();
                alert('Booking cancelled successfully');
            } else {
                alert(data.message || 'Failed to cancel booking');
            }
        } catch (error) {
            console.error('Cancellation error:', error);
            alert('Failed to cancel booking. Please try again.');
        }
    };

    /**
     * Calculate duration display
     */
    const getDurationDisplay = (duration) => {
        if (!duration) return '';
        return duration === 1 ? '1 hour' : `${duration} hours`;
    };

    /**
     * Get rate per hour based on court type
     */
    const getRatePerHour = (courtType) => {
        return courtType?.toLowerCase() === 'paddle' ? pricing.paddle : pricing.tennis;
    };

    // Early Return Pattern
    if (loading && !user) {
        return (
            <div className="loader-container apple-fade-in" style={{ textAlign: 'center', marginTop: '20vh' }}>
                <p className="text-muted">Authenticating your session...</p>
            </div>
        );
    }

    return (
        <div className="bookings-page-container apple-fade-in">
            <header className="page-header" style={{ marginBottom: '2.5rem' }}>
                <Link to="/dashboard" className="see-all-btn" style={{ textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
                    ← Dashboard
                </Link>
                <h1 className="hero-title" style={{ fontSize: '2.5rem' }}>My Reservations</h1>
                <p className="text-muted">Manage your schedule and match history.</p>
                
                {/* Pricing Summary */}
                <div className="pricing-summary" style={{
                    display: 'flex',
                    gap: '20px',
                    marginTop: '15px',
                    padding: '10px 20px',
                    background: 'rgba(0,0,0,0.02)',
                    borderRadius: '30px',
                    fontSize: '0.9rem',
                    justifyContent: 'center'
                }}>
                    <span>🎾 Tennis: {formatPrice(pricing.tennis)}/hr</span>
                    <span>🏸 Padel: {formatPrice(pricing.paddle)}/hr</span>
                </div>
            </header>

            {loading ? (
                <div className="loader-container" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p className="text-muted">Fetching your tickets...</p>
                </div>
            ) : error ? (
                <div className="glass-panel" style={{ padding: '20px', color: 'var(--system-red)', textAlign: 'center', margin: '20px' }}>
                    {error}
                </div>
            ) : (
                <div className="bookings-stack">
                    {(bookings || []).length > 0 ? (
                        bookings.map((b, index) => {
                            const ratePerHour = getRatePerHour(b?.courtType);
                            return (
                                <div key={b?._id || index} className={`glass-panel ticket-card ${b?.status === 'cancelled' ? 'ticket-cancelled' : ''}`}>
                                    <div className="ticket-main">
                                        <div className="sport-tag" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                            <div className="status-pill" style={{ fontSize: '0.6rem', padding: '2px 8px' }}>
                                                {getCourtIcon(b?.courtType)} {(b?.courtType || 'Sport').toUpperCase()}
                                            </div>
                                            {b?.duration > 1 && (
                                                <div className="duration-badge" style={{
                                                    fontSize: '0.6rem',
                                                    padding: '2px 8px',
                                                    background: 'rgba(0,0,0,0.05)',
                                                    borderRadius: '12px'
                                                }}>
                                                    {getDurationDisplay(b.duration)}
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="court-title">
                                            Court {b?.courtNumber || '?'}
                                            <span style={{ fontSize: '0.8rem', marginLeft: '10px', fontWeight: 'normal', opacity: 0.7 }}>
                                                {ratePerHour} EGP/hr
                                            </span>
                                        </h3>
                                        <div className="ticket-details" style={{ display: 'flex', gap: '24px', marginTop: 'auto' }}>
                                            <div className="detail-item">
                                                <span className="date-label" style={{ display: 'block', fontSize: '0.65rem' }}>DATE</span>
                                                <span style={{ fontWeight: '700', color: 'var(--brand-navy)' }}>{formatDate(b?.date)}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="date-label" style={{ display: 'block', fontSize: '0.65rem' }}>TIME</span>
                                                <span style={{ fontWeight: '700', color: 'var(--brand-navy)' }}>{b?.timeSlot || "--:--"}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="date-label" style={{ display: 'block', fontSize: '0.65rem' }}>DURATION</span>
                                                <span style={{ fontWeight: '700', color: 'var(--brand-navy)' }}>{getDurationDisplay(b?.duration)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="ticket-divider"></div>

                                    <div className="ticket-stub">
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            <span className={`status-pill ${getStatusClass(b?.status)}`}>
                                                {b?.status || 'Pending'}
                                            </span>
                                            <div className="price-tag" style={{ fontSize: '1.2rem' }}>
                                                {formatPrice(b?.totalPrice || (b?.duration * ratePerHour))}
                                            </div>
                                            <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>
                                                {ratePerHour} EGP × {b?.duration || 1}h
                                            </span>
                                            {b?.paymentStatus === 'pending' && b?.status !== 'cancelled' && (
                                                <span style={{ fontSize: '0.65rem', color: 'var(--system-red)', fontWeight: '800', marginTop: '5px' }}>
                                                    ⚠️ UNPAID
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Cancel button for active bookings */}
                                        {b?.status === 'active' && (
                                            <button
                                                onClick={() => handleCancel(b._id)}
                                                className="cancel-btn"
                                                style={{
                                                    marginTop: '10px',
                                                    padding: '5px 10px',
                                                    background: 'rgba(255,59,48,0.1)',
                                                    border: '1px solid rgba(255,59,48,0.3)',
                                                    borderRadius: '6px',
                                                    color: 'var(--system-red)',
                                                    fontSize: '0.7rem',
                                                    cursor: 'pointer',
                                                    width: '100%'
                                                }}
                                            >
                                                Cancel Booking
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="glass-panel empty-state" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎾</div>
                            <h3>No sessions yet</h3>
                            <p className="text-muted">Your reserved courts will appear here as tickets.</p>
                            <p style={{ fontSize: '0.85rem', marginTop: '5px', opacity: 0.7 }}>
                                Rates: Tennis {formatPrice(pricing.tennis)}/hr • Padel {formatPrice(pricing.paddle)}/hr
                            </p>
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