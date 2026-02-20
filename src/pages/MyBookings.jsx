import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/MyBookings.css'; 

// ===== FALLBACKS - Isolated inline (no extra files) =====
const BookingsFallbacks = {
    // Bookings cache (5 min TTL)
    bookingsCache: {
        data: null,
        timestamp: null,
        email: null,
        
        get(email) {
            if (this.email === email && this.data && Date.now() - this.timestamp < 300000) {
                return this.data;
            }
            return null;
        },
        
        set(email, data) {
            this.data = data;
            this.timestamp = Date.now();
            this.email = email;
            try {
                localStorage.setItem(`okz_bookings_${email}`, JSON.stringify({
                    data: this.data,
                    timestamp: this.timestamp
                }));
            } catch (e) {}
        },
        
        loadFromStorage(email) {
            try {
                const saved = localStorage.getItem(`okz_bookings_${email}`);
                if (saved) {
                    const { data, timestamp } = JSON.parse(saved);
                    if (Date.now() - timestamp < 300000) {
                        this.data = data;
                        this.timestamp = timestamp;
                        this.email = email;
                        return data;
                    }
                }
            } catch (e) {}
            return null;
        }
    },

    // Pricing cache (24h TTL)
    pricingCache: {
        data: { padel: 400, tennis: 150 },
        timestamp: Date.now(),
        
        get() {
            if (Date.now() - this.timestamp < 86400000) return this.data;
            return null;
        },
        
        set(data) {
            this.data = data;
            this.timestamp = Date.now();
            try {
                localStorage.setItem('okz_pricing', JSON.stringify({
                    data: this.data,
                    timestamp: this.timestamp
                }));
            } catch (e) {}
        },
        
        loadFromStorage() {
            try {
                const saved = localStorage.getItem('okz_pricing');
                if (saved) {
                    const { data, timestamp } = JSON.parse(saved);
                    if (Date.now() - timestamp < 86400000) {
                        this.data = data;
                        this.timestamp = timestamp;
                    }
                }
            } catch (e) {}
        }
    },

    // Retry with exponential backoff
    async retry(fn, maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (err) {
                const isLast = i === maxRetries - 1;
                if (isLast) throw err;
                
                const wait = 1000 * Math.pow(2, i);
                console.log(`🔄 Retry ${i + 1}/${maxRetries} in ${wait}ms`);
                await new Promise(r => setTimeout(r, wait));
            }
        }
    },

    // Timeout wrapper (8 seconds)
    async withTimeout(promise, ms = 8000) {
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), ms)
        );
        return Promise.race([promise, timeout]);
    },

    // Network status
    network: {
        isOnline: navigator.onLine,
        
        init() {
            window.addEventListener('online', () => { this.isOnline = true; });
            window.addEventListener('offline', () => { this.isOnline = false; });
        }
    },

    // Cancellation queue for retry
    cancelQueue: [],
    
    addToCancelQueue(bookingId, userEmail) {
        this.cancelQueue.push({ bookingId, userEmail, time: Date.now() });
        try {
            localStorage.setItem('okz_cancel_queue', JSON.stringify(this.cancelQueue));
        } catch (e) {}
    },
    
    loadCancelQueue() {
        try {
            const saved = localStorage.getItem('okz_cancel_queue');
            if (saved) this.cancelQueue = JSON.parse(saved);
        } catch (e) {}
    },

    // Error messages
    messages: {
        fetch: 'Unable to load bookings. Showing cached data.',
        cancel: 'Unable to cancel. Will retry automatically.',
        offline: 'You are offline. Showing last saved bookings.',
        timeout: 'Request timed out. Please try again.',
        default: 'Something went wrong. Please try again.'
    },

    // Track failures
    failureCount: 0,
    lastFailure: null,
    
    recordFailure() {
        this.failureCount++;
        this.lastFailure = Date.now();
    },
    
    shouldBlock() {
        if (this.failureCount >= 5 && Date.now() - this.lastFailure < 300000) {
            return true; // Block for 5 minutes after 5 failures
        }
        if (Date.now() - this.lastFailure > 300000) {
            this.failureCount = 0;
        }
        return false;
    }
};

// Initialize
BookingsFallbacks.pricingCache.loadFromStorage();
BookingsFallbacks.loadCancelQueue();
BookingsFallbacks.network.init();
// ===== END FALLBACKS =====

// Location constants - Google Maps only
const GOOGLE_MAPS_LINK = "https://maps.app.goo.gl/iJEQqNvDZypno3PM9?g_st=iw";
const CLUB_ADDRESS = "OKZ Sports Complex, Cairo, Egypt";

const MyBookings = ({ user }) => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [offlineNotice, setOfflineNotice] = useState(false);
    
    // FIX 1: Changed 'paddle' to 'padel' in initial state
    const [pricing, setPricing] = useState(() => {
        // FAIL SAFE: Load from cache on init
        const cached = BookingsFallbacks.pricingCache.get();
        return cached || { padel: 400, tennis: 150 };
    });

    // Fetch pricing info
    useEffect(() => {
        fetchPricing();
    }, []);

    // FIX 2: Updated fetchPricing to use 'padel' instead of 'paddle'
    const fetchPricing = async () => {
        // FAIL HARD: Check circuit breaker
        if (BookingsFallbacks.shouldBlock()) {
            console.log('⚠️ Circuit breaker open, using cached pricing');
            return;
        }

        try {
            // FAIL HARD: Add timeout
            const response = await BookingsFallbacks.withTimeout(
                fetch('https://okz.onrender.com/api/status')
            );
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            if (data?.system?.pricing) {
                const newPricing = {
                    padel: parseInt(data.system.pricing.padel) || 400,
                    tennis: parseInt(data.system.pricing.tennis) || 150
                };
                setPricing(newPricing);
                // FAIL SAFE: Update cache
                BookingsFallbacks.pricingCache.set(newPricing);
                BookingsFallbacks.failureCount = 0;
            }
        } catch (error) {
            console.error('Failed to fetch pricing:', error);
            BookingsFallbacks.recordFailure();
            
            // FAIL SAFE: Use cached pricing
            const cached = BookingsFallbacks.pricingCache.get();
            if (cached) setPricing(cached);
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

        // FAIL SAFE: Check cache first if offline
        if (!BookingsFallbacks.network.isOnline) {
            const cached = BookingsFallbacks.bookingsCache.loadFromStorage(user.email);
            if (cached) {
                setBookings(cached);
                setOfflineNotice(true);
                setLoading(false);
                return;
            }
        }

        // FAIL HARD: Check circuit breaker
        if (BookingsFallbacks.shouldBlock()) {
            setError('Too many failed attempts. Please try again later.');
            setLoading(false);
            return;
        }

        try {
            // FAIL HARD: Add timeout and retry
            const response = await BookingsFallbacks.retry(async () => {
                return await BookingsFallbacks.withTimeout(
                    fetch('https://okz.onrender.com/api/v1/bookings', {
                        method: 'GET',
                        headers: {
                            'x-user-email': user.email,
                            'Content-Type': 'application/json'
                        }
                    })
                );
            });

            // Handle non-JSON responses
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server returned an invalid response.");
            }

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                const bookingsData = result?.data?.bookings || [];
                setBookings(bookingsData);
                setError(null);
                BookingsFallbacks.failureCount = 0;
                
                // FAIL SAFE: Update cache
                BookingsFallbacks.bookingsCache.set(user.email, bookingsData);
            } else {
                throw new Error(result.message || 'Failed to load bookings.');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            BookingsFallbacks.recordFailure();
            
            // FAIL SAFE: Try cache
            const cached = BookingsFallbacks.bookingsCache.loadFromStorage(user.email);
            if (cached) {
                setBookings(cached);
                setOfflineNotice(true);
                setError(BookingsFallbacks.messages.fetch);
            } else {
                setError(err.message || 'Unable to connect to server.');
            }
        } finally {
            setLoading(false);
        }
    }, [user?.email]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // Process cancel queue when online
    useEffect(() => {
        const processCancelQueue = async () => {
            if (BookingsFallbacks.network.isOnline && BookingsFallbacks.cancelQueue.length > 0 && user?.email) {
                const queue = [...BookingsFallbacks.cancelQueue];
                BookingsFallbacks.cancelQueue = [];
                
                for (const item of queue) {
                    if (item.userEmail === user.email) {
                        try {
                            await fetch(`https://okz.onrender.com/api/v1/bookings/${item.bookingId}`, {
                                method: 'DELETE',
                                headers: {
                                    'x-user-email': user.email,
                                    'Content-Type': 'application/json'
                                }
                            });
                        } catch (e) {
                            // Re-queue if fails
                            BookingsFallbacks.addToCancelQueue(item.bookingId, user.email);
                        }
                    }
                }
                fetchBookings(); // Refresh
            }
        };
        
        processCancelQueue();
    }, [user, BookingsFallbacks.network.isOnline]);

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
     * FIX 3: Get court type icon - changed 'paddle' to 'padel'
     */
    const getCourtIcon = (courtType) => {
        return courtType?.toLowerCase() === 'padel' ? '🏸' : '🎾';
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

        // FAIL SAFE: Handle offline
        if (!BookingsFallbacks.network.isOnline) {
            BookingsFallbacks.addToCancelQueue(bookingId, user.email);
            alert('You are offline. Cancellation will be processed when online.');
            return;
        }

        try {
            // FAIL HARD: Add timeout
            const response = await BookingsFallbacks.withTimeout(
                fetch(`https://okz.onrender.com/api/v1/bookings/${bookingId}`, {
                    method: 'DELETE',
                    headers: {
                        'x-user-email': user.email,
                        'Content-Type': 'application/json'
                    }
                })
            );

            const data = await response.json();

            if (response.ok) {
                // Refresh bookings list
                await fetchBookings();
                alert('Booking cancelled successfully');
            } else {
                alert(data.message || 'Failed to cancel booking');
            }
        } catch (error) {
            console.error('Cancellation error:', error);
            
            // FAIL SAFE: Queue for retry
            if (!BookingsFallbacks.network.isOnline || error.message === 'Request timeout') {
                BookingsFallbacks.addToCancelQueue(bookingId, user.email);
                alert(BookingsFallbacks.messages.cancel);
            } else {
                alert('Failed to cancel booking. Please try again.');
            }
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
     * FIX 4: Get rate per hour based on court type - changed 'paddle' to 'padel'
     */
    const getRatePerHour = (courtType) => {
        return courtType?.toLowerCase() === 'padel' ? pricing.padel : pricing.tennis;
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
            {/* FAIL SAFE: Offline/error notices */}
            {offlineNotice && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#ffc107',
                    color: '#000',
                    padding: '8px 16px',
                    borderRadius: '30px',
                    fontSize: '0.85rem',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    📱 Offline mode - Showing cached data
                </div>
            )}

            <header className="page-header" style={{ marginBottom: '2.5rem' }}>
                <Link to="/dashboard" className="see-all-btn" style={{ textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
                    ← Dashboard
                </Link>
                <h1 className="hero-title" style={{ fontSize: '2.5rem' }}>My Reservations</h1>
                <p className="text-muted">Manage your schedule and match history.</p>
                
                {/* FIX 5: Pricing Summary */}
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
                    <span>🏸 Padel: {formatPrice(pricing.padel)}/hr</span>
                </div>
            </header>

            {loading ? (
                <div className="loader-container" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p className="text-muted">Fetching your tickets...</p>
                </div>
            ) : error ? (
                <div className="glass-panel" style={{ padding: '20px', color: 'var(--system-red)', textAlign: 'center', margin: '20px' }}>
                    {error}
                    {offlineNotice && (
                        <button 
                            onClick={fetchBookings}
                            style={{
                                marginTop: '10px',
                                padding: '8px 16px',
                                background: 'var(--brand-navy)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            Retry
                        </button>
                    )}
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
                                        
                                        {/* Ticket Details */}
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

                                        {/* LOCATION BLOCK - Google Maps Only */}
                                        <div className="location-footer" style={{ 
                                            marginTop: '20px', 
                                            paddingTop: '15px', 
                                            borderTop: '1px dashed rgba(0,0,0,0.1)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                <span style={{ fontSize: '1rem' }}>📍</span>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--brand-navy)', opacity: 0.6 }}>LOCATION</span>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--brand-navy)' }}>{CLUB_ADDRESS}</span>
                                                </div>
                                            </div>
                                            
                                            {/* Google Maps Link */}
                                            <a 
                                                href={GOOGLE_MAPS_LINK}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="map-link-action"
                                                style={{
                                                    textDecoration: 'none',
                                                    fontSize: '0.75rem',
                                                    color: '#4285F4',
                                                    fontWeight: '700',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    width: 'fit-content'
                                                }}
                                            >
                                                📱 Open in Google Maps →
                                            </a>

                                            {/* Google Maps Embed */}
                                            <div style={{ 
                                                marginTop: '10px', 
                                                borderRadius: '8px', 
                                                overflow: 'hidden', 
                                                height: '120px', 
                                                width: '100%',
                                                border: '1px solid rgba(0,0,0,0.05)',
                                                position: 'relative'
                                            }}>
                                                <iframe 
                                                    title="Court Location Map"
                                                    width="100%" 
                                                    height="120" 
                                                    frameBorder="0" 
                                                    style={{ border: 0, borderRadius: '8px' }}
                                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3456.789!2d31.2357!3d30.0444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDAyJzQwLjAiTiAzMcKwMTQnMDguNSJF!5e0!3m2!1sen!2seg!4v1234567890"
                                                    loading="lazy"
                                                    allowFullScreen
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                >
                                                </iframe>
                                            </div>
                                            
                                            <div style={{
                                                fontSize: '0.65rem',
                                                color: '#666',
                                                marginTop: '4px',
                                                fontStyle: 'italic'
                                            }}>
                                                ⚡ Click the map link for exact directions
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
                                        
                                        {/* Cancel button */}
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
                                Rates: Tennis {formatPrice(pricing.tennis)}/hr • Padel {formatPrice(pricing.padel)}/hr
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