import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Dashboard.css';

// ===== FALLBACKS - Isolated inline (no extra files) =====
const DashboardFallbacks = {
    // Recent bookings cache (2 min TTL)
    bookingsCache: {
        data: null,
        timestamp: null,
        email: null,
        
        get(email) {
            if (this.email === email && this.data && Date.now() - this.timestamp < 120000) {
                return this.data;
            }
            return null;
        },
        
        set(email, data) {
            this.data = data;
            this.timestamp = Date.now();
            this.email = email;
            try {
                localStorage.setItem(`okz_dashboard_${email}`, JSON.stringify({
                    data: this.data,
                    timestamp: this.timestamp
                }));
            } catch (e) {}
        },
        
        loadFromStorage(email) {
            try {
                const saved = localStorage.getItem(`okz_dashboard_${email}`);
                if (saved) {
                    const { data, timestamp } = JSON.parse(saved);
                    if (Date.now() - timestamp < 120000) {
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
    async retry(fn, maxRetries = 2) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (err) {
                const isLast = i === maxRetries - 1;
                if (isLast) throw err;
                
                const wait = 1000 * Math.pow(2, i);
                console.log(`🔄 Dashboard retry ${i + 1}/${maxRetries} in ${wait}ms`);
                await new Promise(r => setTimeout(r, wait));
            }
        }
    },

    // Timeout wrapper (6 seconds - shorter for dashboard)
    async withTimeout(promise, ms = 6000) {
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

    // Track failures
    failureCount: 0,
    lastFailure: null,
    
    recordFailure() {
        this.failureCount++;
        this.lastFailure = Date.now();
    },
    
    shouldBlock() {
        if (this.failureCount >= 3 && Date.now() - this.lastFailure < 300000) {
            return true; // Block for 5 minutes after 3 failures
        }
        if (Date.now() - this.lastFailure > 300000) {
            this.failureCount = 0;
        }
        return false;
    },

    // Error messages
    messages: {
        bookings: 'Unable to load recent activity. Showing cached data.',
        pricing: 'Using cached rates.',
        offline: 'You are offline - showing cached data.',
        timeout: 'Request timed out. Please check your connection.',
        default: 'Something went wrong.'
    }
};

// Initialize
DashboardFallbacks.pricingCache.loadFromStorage();
DashboardFallbacks.network.init();
// ===== END FALLBACKS =====

const UserDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [offlineNotice, setOfflineNotice] = useState(false);
    
    // FIX 1: Changed 'paddle' to 'padel' in initial state
    const [pricing, setPricing] = useState(() => {
        // FAIL SAFE: Load from cache on init
        const cached = DashboardFallbacks.pricingCache.get();
        return cached || { padel: 400, tennis: 150 };
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

        // FAIL SAFE: Check cache first if offline
        if (!DashboardFallbacks.network.isOnline) {
            const cached = DashboardFallbacks.bookingsCache.loadFromStorage(user.email);
            if (cached) {
                setRecentBookings(cached);
                setOfflineNotice(true);
                setLoading(false);
                return;
            }
        }

        // FAIL HARD: Check circuit breaker
        if (DashboardFallbacks.shouldBlock()) {
            setOfflineNotice(true);
            setLoading(false);
            return;
        }

        try {
            // FAIL HARD: Fetch bookings with timeout and retry
            let bookingsData = [];
            try {
                const response = await DashboardFallbacks.retry(async () => {
                    return await DashboardFallbacks.withTimeout(
                        fetch('https://okz.onrender.com/api/v1/bookings', {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-user-email': user.email
                            }
                        })
                    );
                });

                if (response.ok) {
                    const res = await response.json();
                    if (res.status === 'success') {
                        bookingsData = res?.data?.bookings?.slice(0, 3) || [];
                        setRecentBookings(bookingsData);
                        // FAIL SAFE: Update cache
                        DashboardFallbacks.bookingsCache.set(user.email, bookingsData);
                    }
                }
            } catch (bookingsError) {
                console.error('Bookings fetch error:', bookingsError);
                DashboardFallbacks.recordFailure();
                
                // FAIL SAFE: Try cache
                const cached = DashboardFallbacks.bookingsCache.loadFromStorage(user.email);
                if (cached) {
                    setRecentBookings(cached);
                    setOfflineNotice(true);
                }
            }

            // FAIL HARD: Fetch pricing with timeout (don't block if this fails)
            try {
                const statusResponse = await DashboardFallbacks.withTimeout(
                    fetch('https://okz.onrender.com/api/status')
                );

                if (statusResponse.ok) {
                    const statusData = await statusResponse.json();
                    if (statusData?.system?.pricing) {
                        const newPricing = {
                            padel: parseInt(statusData.system.pricing.padel || statusData.system.pricing.paddle) || 400,
                            tennis: parseInt(statusData.system.pricing.tennis) || 150
                        };
                        setPricing(newPricing);
                        // FAIL SAFE: Update cache
                        DashboardFallbacks.pricingCache.set(newPricing);
                    }
                }
            } catch (pricingError) {
                console.error('Pricing fetch error:', pricingError);
                // FAIL SAFE: Keep using cached pricing
                const cached = DashboardFallbacks.pricingCache.get();
                if (cached) setPricing(cached);
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
            {/* FAIL SAFE: Offline/notice banner */}
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
                    📱 {DashboardFallbacks.network.isOnline ? 'Using cached data' : 'Offline mode - showing cached data'}
                </div>
            )}

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

                    {/* FAIL SAFE: Manual retry button if showing cached data */}
                    {offlineNotice && recentBookings.length > 0 && (
                        <button
                            onClick={fetchDashboardData}
                            style={{
                                marginTop: '15px',
                                padding: '8px',
                                background: 'none',
                                border: '1px solid var(--brand-navy)',
                                borderRadius: '20px',
                                color: 'var(--brand-navy)',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                width: '100%'
                            }}
                        >
                            ⟳ Retry
                        </button>
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
                    
                    {/* FAIL SAFE: Show cache indicator */}
                    {offlineNotice && (
                        <div style={{
                            marginTop: '15px',
                            fontSize: '0.7rem',
                            color: '#666',
                            textAlign: 'center',
                            fontStyle: 'italic'
                        }}>
                            ⚡ Rates may be cached
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;