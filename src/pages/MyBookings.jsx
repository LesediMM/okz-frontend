import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
        <div className="my-bookings-page apple-fade-in">
            <header className="page-header">
                <Link to="/dashboard" className="back-link">← Dashboard</Link>
                <h1>My Reservations</h1>
                <p className="text-muted">History and upcoming games for {user?.fullName}</p>
            </header>

            {!user && (
                <div className="card glass-card empty-state">
                    <p>Please sign in to view your schedule.</p>
                    <Link to="/login" className="btn btn-primary">Sign In</Link>
                </div>
            )}

            {loading && (
                <div className="loader-container">
                    <div className="loader"></div>
                    <p>Updating your schedule...</p>
                </div>
            )}
            
            {error && <div className="apple-alert error">{error}</div>}

            {!loading && user && (
                <div className="booking-stack">
                    {bookings.length > 0 ? (
                        bookings.map((b) => (
                            <div key={b._id} className={`booking-ticket ${b.status === 'cancelled' ? 'ticket-muted' : ''}`}>
                                <div className="ticket-main">
                                    <div className="sport-indicator">
                                        <span className={`dot ${b.courtType}`}></span>
                                        <strong>{b.courtType.toUpperCase()}</strong>
                                    </div>
                                    <h3 className="court-name">Court {b.courtNumber}</h3>
                                    <div className="ticket-time">
                                        <span>📅 {formatDate(b.date)}</span>
                                        <span className="time-sep">•</span>
                                        <span>⏰ {b.timeSlot}</span>
                                    </div>
                                </div>
                                
                                <div className="ticket-divider"></div>

                                <div className="ticket-side">
                                    <span className={`apple-badge status-${b.status.toLowerCase()}`}>
                                        {b.status}
                                    </span>
                                    <div className="price-tag">{b.totalPrice} EGP</div>
                                    {b.paymentStatus === 'pending' && b.status !== 'cancelled' && (
                                        <div className="pay-prompt">Unpaid</div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="card glass-card empty-state">
                            <div className="empty-icon">🎾</div>
                            <h3>No bookings yet</h3>
                            <p>Ready to get on the court? Your reservations will appear here.</p>
                            <button onClick={() => navigate('/booking')} className="btn btn-primary">
                                Book Your First Court
                            </button>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                .my-bookings-page {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 2rem 1rem;
                }

                .page-header {
                    margin-bottom: 3rem;
                }

                .back-link {
                    color: var(--system-blue);
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 0.9rem;
                    display: block;
                    margin-bottom: 1rem;
                }

                .page-header h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    letter-spacing: -1px;
                }

                /* Ticket Design */
                .booking-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .booking-ticket {
                    display: flex;
                    background: var(--card-bg);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: var(--glass-shadow);
                }

                .ticket-muted {
                    opacity: 0.6;
                    filter: grayscale(0.5);
                }

                .ticket-main {
                    flex: 1;
                    padding: 24px;
                }

                .sport-indicator {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.75rem;
                    letter-spacing: 1px;
                    color: var(--text-muted);
                    margin-bottom: 8px;
                }

                .dot { width: 8px; height: 8px; border-radius: 50%; }
                .dot.tennis { background: var(--system-blue); }
                .dot.padel { background: var(--system-green); }

                .court-name {
                    font-size: 1.4rem;
                    font-weight: 700;
                    margin-bottom: 12px;
                }

                .ticket-time {
                    font-size: 0.95rem;
                    font-weight: 500;
                    display: flex;
                    gap: 10px;
                    color: var(--text-main);
                }

                .time-sep { color: var(--system-gray); }

                /* Perforated Edge Effect */
                .ticket-divider {
                    width: 1px;
                    border-left: 2px dashed rgba(0,0,0,0.1);
                    margin: 15px 0;
                    position: relative;
                }

                .ticket-side {
                    width: 140px;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0,0,0,0.02);
                }

                .price-tag {
                    font-weight: 800;
                    font-size: 1.1rem;
                    margin: 12px 0 4px;
                }

                .pay-prompt {
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: var(--system-red);
                    text-transform: uppercase;
                }

                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem !important;
                }

                .empty-icon { font-size: 3rem; margin-bottom: 1rem; }

                @media (max-width: 600px) {
                    .booking-ticket { flex-direction: column; }
                    .ticket-divider { width: 100%; height: 1px; border-left: none; border-top: 2px dashed rgba(0,0,0,0.1); margin: 0; }
                    .ticket-side { width: 100%; padding: 15px; flex-direction: row; justify-content: space-around; }
                }
            `}</style>
        </div>
    );
};

export default MyBookings;