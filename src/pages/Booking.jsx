import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Booking.css';

// ===== FALLBACKS - Isolated inline (no extra files) =====
const BookingFallbacks = {
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

    // Request queue for offline bookings
    bookingQueue: [],
    
    loadQueue() {
        try {
            const saved = localStorage.getItem('okz_booking_queue');
            if (saved) this.bookingQueue = JSON.parse(saved);
        } catch (e) {}
    },
    
    saveQueue() {
        try {
            localStorage.setItem('okz_booking_queue', JSON.stringify(this.bookingQueue));
        } catch (e) {}
    },
    
    addToQueue(bookingData, userEmail) {
        this.bookingQueue.push({
            ...bookingData,
            userEmail,
            queuedAt: Date.now(),
            id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        });
        this.saveQueue();
    },
    
    // Retry with exponential backoff
    async retry(fn, maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (err) {
                const isLast = i === maxRetries - 1;
                if (isLast) throw err;
                
                // Don't retry validation errors
                if (err.message?.includes('Validation')) throw err;
                
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

    // Network status tracker
    network: {
        isOnline: navigator.onLine,
        
        init() {
            window.addEventListener('online', () => {
                this.isOnline = true;
                this.processQueue();
            });
            window.addEventListener('offline', () => { this.isOnline = false; });
        },
        
        processQueue() {
            if (this.isOnline && BookingFallbacks.bookingQueue.length > 0) {
                console.log(`🔄 Processing ${BookingFallbacks.bookingQueue.length} queued bookings...`);
                // Will be processed by component when user returns
            }
        }
    },

    // Error messages (user-friendly)
    messages: {
        network: 'Network connection unstable. Your booking has been queued.',
        timeout: 'Request timed out. Please try again.',
        server: 'Server is waking up. Your booking is queued.',
        validation: 'Please check your information.',
        offline: 'You are offline. Booking saved locally.',
        default: 'Unable to book. Please try again.'
    },

    // Track failed attempts (simple circuit breaker)
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
            this.failureCount = 0; // Reset after 5 minutes
        }
        return false;
    }
};

// Initialize
BookingFallbacks.pricingCache.loadFromStorage();
BookingFallbacks.loadQueue();
BookingFallbacks.network.init();
// ===== END FALLBACKS =====

const Booking = ({ user }) => {
    const navigate = useNavigate();
    
    const [bookingData, setBookingData] = useState({
        date: new Date().toISOString().split('T')[0],
        courtType: 'padel',
        courtNumber: 1,
        timeSlot: '',
        duration: 1,
        phoneNumber: ''
    });

    const [pricing, setPricing] = useState(() => {
        // FAIL SAFE: Load from cache on init
        const cached = BookingFallbacks.pricingCache.get();
        return cached || { padel: 400, tennis: 150 };
    });
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [offlineNotice, setOfflineNotice] = useState(false);

    // ✅ ADD THIS HELPER FUNCTION - Professional Phone Validation
    const validatePhoneNumber = (phone) => {
        const phoneRegex = /^[0-9+\s-]{8,15}$/;
        return phoneRegex.test(phone.trim());
    };

    // Fetch pricing on component mount
    useEffect(() => {
        fetchPricing();
    }, []);

    const fetchPricing = async () => {
        // FAIL HARD: Check circuit breaker
        if (BookingFallbacks.shouldBlock()) {
            console.log('⚠️ Circuit breaker open, using cached pricing');
            return;
        }

        try {
            // FAIL HARD: Add timeout to fetch
            const response = await BookingFallbacks.withTimeout(
                fetch('https://okz.onrender.com/api/status')
            );
            
            // FAIL HARD: Check response
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            
            if (data?.system?.pricing) {
                const newPricing = {
                    padel: parseInt(data.system.pricing.padel) || 400,
                    tennis: parseInt(data.system.pricing.tennis) || 150
                };
                setPricing(newPricing);
                // FAIL SAFE: Update cache
                BookingFallbacks.pricingCache.set(newPricing);
                BookingFallbacks.failureCount = 0; // Reset on success
            }
        } catch (error) {
            console.error('Failed to fetch pricing:', error);
            BookingFallbacks.recordFailure();
            
            // FAIL SAFE: Use cached pricing
            const cached = BookingFallbacks.pricingCache.get();
            if (cached) {
                setPricing(cached);
            }
        }
    };

    // Helper functions for date constraints
    const getToday = () => new Date().toISOString().split('T')[0];
    const getMaxDate = () => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d.toISOString().split('T')[0];
    };

    // Court Mapping - Synced with Backend
    const courts = bookingData.courtType === 'padel'
        ? [{ v: 1, t: 'Padel Court 1' }, { v: 2, t: 'Padel Court 2' }]
        : [{ v: 3, t: 'Tennis Court 1' }, { v: 4, t: 'Tennis Court 2' }, { v: 5, t: 'Tennis Court 3' }];

    // Smart Time Slot Filtering - NOW CAIRO TIMEZONE AWARE
    const generateAvailableSlots = () => {
        const slots = [];
        
        // 1. Get current Cairo Hour and Date
        const now = new Date();
        const cairoFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Africa/Cairo',
            hour: 'numeric',
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        // Get parts to reconstruct Cairo today's date string
        const parts = cairoFormatter.formatToParts(now);
        const cairoHour = parseInt(parts.find(p => p.type === 'hour').value);
        const cairoYear = parts.find(p => p.type === 'year').value;
        const cairoMonth = parts.find(p => p.type === 'month').value;
        const cairoDay = parts.find(p => p.type === 'day').value;
        
        const cairoTodayStr = `${cairoYear}-${cairoMonth}-${cairoDay}`;
        const isToday = bookingData.date === cairoTodayStr;

        // 2. Generate slots based on Cairo operating hours
        for (let hour = 8; hour < 22; hour++) { 
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            
            // 🛡️ Filter out times that have already passed in Cairo
            if (isToday && hour <= cairoHour) {
                continue; 
            }
            slots.push(timeStr);
        }
        return slots;
    };

    const timeSlots = generateAvailableSlots();

    // Calculate total price based on court type and duration
    const calculateTotalPrice = () => {
        const rate = bookingData.courtType === 'padel' ? pricing.padel : pricing.tennis;
        return bookingData.duration * rate;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => ({ 
            ...prev, 
            [name]: name === 'courtNumber' || name === 'duration' ? Number(value) : value,
            ...(name === 'courtType' && { courtNumber: value === 'padel' ? 1 : 3 }),
            ...(name === 'date' && { timeSlot: '' }) // ✨ CLEAR timeSlot if date changes
        }));
    };

    // FAIL SAFE: Process queued bookings when online
    useEffect(() => {
        const processQueue = async () => {
            if (navigator.onLine && BookingFallbacks.bookingQueue.length > 0 && user?.email) {
                const queue = [...BookingFallbacks.bookingQueue];
                BookingFallbacks.bookingQueue = [];
                BookingFallbacks.saveQueue();
                
                for (const queued of queue) {
                    if (queued.userEmail === user.email) {
                        try {
                            await fetch('https://okz.onrender.com/api/v1/bookings', {
                                method: 'POST',
                                headers: { 
                                    'Content-Type': 'application/json',
                                    'x-user-email': user.email 
                                },
                                body: JSON.stringify(queued)
                            });
                        } catch (e) {
                            // Re-queue if fails
                            BookingFallbacks.addToQueue(queued, user.email);
                        }
                    }
                }
            }
        };
        
        processQueue();
    }, [user, navigator.onLine]);

    const handleBooking = async () => {
        // 🛡️ Guard 1: Redirect if no user
        if (!user) { 
            alert("Please login to reserve a court.");
            navigate('/login'); 
            return; 
        }

        // 🛡️ Guard 2: Professional Phone Number Validation (UPDATED)
        if (!bookingData.phoneNumber || !validatePhoneNumber(bookingData.phoneNumber)) {
            alert("⚠️ Please enter a valid phone number (8-15 digits, can include +, spaces, or hyphens)");
            return; 
        }

        // 🛡️ Guard 3: The "Data Corruption" Killer (Input Validation)
        if (!bookingData.timeSlot) {
            alert("⚠️ Selection Required: Please pick a time slot first!");
            return; 
        }

        // FAIL HARD: Check circuit breaker
        if (BookingFallbacks.shouldBlock()) {
            alert("⚠️ Too many failed attempts. Please try again in 5 minutes.");
            return;
        }

        // FAIL SAFE: Handle offline mode
        if (!navigator.onLine) {
            BookingFallbacks.addToQueue(bookingData, user.email);
            setOfflineNotice(true);
            alert(BookingFallbacks.messages.offline);
            setTimeout(() => setOfflineNotice(false), 3000);
            return;
        }

        setIsProcessing(true); // Start Spinner

        try {
            // FAIL HARD: Retry logic with timeout
            const response = await BookingFallbacks.retry(async () => {
                return await BookingFallbacks.withTimeout(
                    fetch('https://okz.onrender.com/api/v1/bookings', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'x-user-email': user?.email 
                        },
                        body: JSON.stringify(bookingData)
                    })
                );
            });

            const data = await response.json();

            if (response.ok) { 
                // Success case
                BookingFallbacks.failureCount = 0; // Reset on success
                alert(`✅ Booking confirmed! Total: ${calculateTotalPrice()} EGP`);
                navigate('/my-bookings'); 
            } else { 
                // Handle validation errors
                BookingFallbacks.recordFailure();
                const errorMessage = data.errors 
                    ? data.errors.map(e => e.message).join(", ") 
                    : data.message;
                alert(`Validation Error: ${errorMessage}`); 
            }
        } catch (e) { 
            // Handle failures
            BookingFallbacks.recordFailure();
            console.error("Connection Error:", e);
            
            // FAIL SAFE: Queue booking if offline/error
            if (!navigator.onLine || e.message === 'Request timeout') {
                BookingFallbacks.addToQueue(bookingData, user.email);
                alert(BookingFallbacks.messages.offline);
            } else {
                alert(BookingFallbacks.messages.default);
            }
        } finally { 
            // 🛡️ Guard 5: The "Loading" Killer (Always reset state)
            setIsProcessing(false); 
        }
    };

    // Get current rate display
    const currentRate = bookingData.courtType === 'padel' ? pricing.padel : pricing.tennis;

    return (
        <div className="booking-page-container apple-fade-in">
            {/* FAIL SAFE: Offline notice */}
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
                    📱 Offline mode - Your booking is saved locally
                </div>
            )}

            <header className="page-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 className="hero-title">Reserve a Court</h1>
                <p className="text-muted">Premium Padel and Tennis facilities in Cairo.</p>
                <div className="pricing-badge" style={{
                    display: 'inline-flex',
                    gap: '20px',
                    marginTop: '10px',
                    padding: '8px 20px',
                    background: 'rgba(0,0,0,0.03)',
                    borderRadius: '30px',
                    fontSize: '0.9rem'
                }}>
                    <span>🎾 Tennis: {pricing.tennis} EGP/hr</span>
                    <span>🏸 Padel: {pricing.padel} EGP/hr</span>
                </div>
            </header>

            <div className="booking-layout-grid">
                {/* --- Step 1: Configuration --- */}
                <section className="glass-panel config-panel" style={{ padding: '30px', marginBottom: '40px' }}>
                    <div className="segmented-control">
                        <button 
                            type="button"
                            className={bookingData.courtType === 'padel' ? 'active' : ''}
                            onClick={() => handleInputChange({ target: { name: 'courtType', value: 'padel' }})}
                        >Padel ({pricing.padel} EGP)</button>
                        <button 
                            type="button"
                            className={bookingData.courtType === 'tennis' ? 'active' : ''} 
                            onClick={() => handleInputChange({ target: { name: 'courtType', value: 'tennis' }})}
                        >Tennis ({pricing.tennis} EGP)</button>
                    </div>

                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="field-group">
                            <label className="input-label-tiny">DATE</label>
                            <input 
                                type="date" 
                                name="date" 
                                min={getToday()} 
                                max={getMaxDate()}
                                value={bookingData.date} 
                                onChange={handleInputChange} 
                            />
                        </div>
                        <div className="field-group">
                            <label className="input-label-tiny">DURATION</label>
                            <select name="duration" value={bookingData.duration} onChange={handleInputChange}>
                                <option value="1">1 Hour ({currentRate} EGP)</option>
                                <option value="2">2 Hours ({currentRate * 2} EGP)</option>
                                <option value="3">3 Hours ({currentRate * 3} EGP)</option>
                                <option value="4">4 Hours ({currentRate * 4} EGP)</option>
                            </select>
                        </div>
                    </div>

                    {/* Phone Number Input Field */}
                    <div className="field-group" style={{ marginBottom: '15px' }}>
                        <label className="input-label-tiny">CONTACT PHONE NUMBER</label>
                        <input 
                            type="tel" 
                            name="phoneNumber" 
                            placeholder="e.g., +20 123 456 7890"
                            value={bookingData.phoneNumber} 
                            onChange={handleInputChange} 
                            pattern="[0-9+\s-]{8,15}"
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid rgba(0,0,0,0.1)',
                                fontSize: '1rem'
                            }}
                        />
                        <small style={{ 
                            display: 'block', 
                            fontSize: '0.7rem', 
                            color: '#666', 
                            marginTop: '4px',
                            opacity: 0.7
                        }}>
                            Format: 8-15 digits, can include +, spaces, or hyphens
                        </small>
                    </div>

                    <div className="field-group" style={{ marginTop: '10px' }}>
                        <label className="input-label-tiny">PREVIEW COURT</label>
                        <select name="courtNumber" value={bookingData.courtNumber} onChange={handleInputChange}>
                            {courts.map(c => <option key={c.v} value={c.v}>{c.t}</option>)}
                        </select>
                    </div>

                    {/* Rate indicator */}
                    <div className="rate-indicator" style={{
                        marginTop: '15px',
                        padding: '10px',
                        background: 'rgba(0,102,204,0.05)',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                    }}>
                        <span>💰 Current rate: <strong>{currentRate} EGP/hour</strong></span>
                    </div>
                </section>

                {/* --- Step 2: Time Grid --- */}
                <section className="time-picker-section">
                    <h3 className="section-heading">
                        Available Slots 
                        <span style={{ fontSize: '0.8rem', marginLeft: '10px', fontWeight: 'normal', opacity: 0.7 }}>
                            (Cairo Time - Full hours only)
                        </span>
                    </h3>
                    <div className="time-pill-grid">
                        {timeSlots.length > 0 ? (
                            timeSlots.map(time => (
                                <button 
                                    key={time}
                                    type="button"
                                    className={`time-pill ${bookingData.timeSlot === time ? 'selected' : ''}`}
                                    onClick={() => setBookingData(prev => ({ ...prev, timeSlot: time }))}
                                >
                                    {time}
                                </button>
                            ))
                        ) : (
                            <div className="empty-slots-message" style={{
                                gridColumn: '1/-1',
                                textAlign: 'center',
                                padding: '40px',
                                color: '#666'
                            }}>
                                No available slots for this date. Please select another date.
                            </div>
                        )}
                    </div>
                </section>

                {/* --- Step 3: Checkout Bar --- */}
                <div className="glass-panel floating-checkout-bar">
                    <div className="checkout-flex">
                        <div className="price-display">
                            <span className="price-label">TOTAL</span>
                            <span className="price-value">
                                {calculateTotalPrice()} EGP
                                <span style={{ fontSize: '0.8rem', marginLeft: '5px', opacity: 0.7 }}>
                                    ({currentRate} EGP × {bookingData.duration}h)
                                </span>
                            </span>
                        </div>
                        <button 
                            type="button"
                            className={`confirm-booking-btn ${(!bookingData.timeSlot || !bookingData.phoneNumber || isProcessing) ? 'disabled' : ''}`}
                            onClick={handleBooking}
                            disabled={isProcessing || !bookingData.timeSlot || !bookingData.phoneNumber}
                        >
                            {isProcessing ? 'Processing...' : 'Reserve Now'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Booking;