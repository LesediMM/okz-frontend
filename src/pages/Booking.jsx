import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Booking.css';

const Booking = ({ user }) => {
    const navigate = useNavigate();
    
    const [bookingData, setBookingData] = useState({
        date: new Date().toISOString().split('T')[0],
        courtType: 'padel',
        courtNumber: 1,
        timeSlot: '',
        duration: 1,
        phoneNumber: '' // 👈 Add this line
    });

    const [pricing, setPricing] = useState({
        padel: 400,
        tennis: 150
    });
    
    const [isProcessing, setIsProcessing] = useState(false);

    // Fetch pricing on component mount
    useEffect(() => {
        fetchPricing();
    }, []);

    const fetchPricing = async () => {
        try {
            const response = await fetch('https://okz.onrender.com/api/status');
            const data = await response.json();
            if (data?.system?.pricing) {
                setPricing({
                    padel: parseInt(data.system.pricing.padel) || 400,
                    tennis: parseInt(data.system.pricing.tennis) || 150
                });
            }
        } catch (error) {
            console.error('Failed to fetch pricing:', error);
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

    const handleBooking = async () => {
        // 🛡️ Guard 1: Redirect if no user
        if (!user) { 
            alert("Please login to reserve a court.");
            navigate('/login'); 
            return; 
        }

        // 🛡️ Guard 2: Phone Number Validation
        if (!bookingData.phoneNumber || bookingData.phoneNumber.trim().length < 8) {
            alert("⚠️ Please enter a valid contact phone number.");
            return; 
        }

        // 🛡️ Guard 3: The "Data Corruption" Killer (Input Validation)
        if (!bookingData.timeSlot) {
            alert("⚠️ Selection Required: Please pick a time slot first!");
            return; 
        }

        setIsProcessing(true); // Start Spinner

        try {
            const res = await fetch('https://okz.onrender.com/api/v1/bookings', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    // 🛡️ Guard 4: Safe Property Access
                    'x-user-email': user?.email 
                },
                body: JSON.stringify(bookingData)
            });

            const data = await res.json();

            if (res.ok) { 
                // Success case - show success message with price
                alert(`✅ Booking confirmed! Total: ${calculateTotalPrice()} EGP`);
                navigate('/my-bookings'); 
            } else { 
                // 🛡️ Handle the specific array format from your express-validator
                const errorMessage = data.errors 
                    ? data.errors.map(e => e.message).join(", ") 
                    : data.message;
                alert(`Validation Error: ${errorMessage}`); 
            }
        } catch (e) { 
            // Handle Network failures
            console.error("Connection Error:", e);
            alert("Connection error. The server might be waking up."); 
        } finally { 
            // 🛡️ Guard 5: The "Loading" Killer (Always reset state)
            setIsProcessing(false); 
        }
    };

    // Get current rate display
    const currentRate = bookingData.courtType === 'padel' ? pricing.padel : pricing.tennis;

    return (
        <div className="booking-page-container apple-fade-in">
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
                                max={getMaxDate()} // 🛡️ Prevents "30 days in advance" error
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
                            placeholder="Enter your mobile number"
                            value={bookingData.phoneNumber} 
                            onChange={handleInputChange} 
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid rgba(0,0,0,0.1)',
                                fontSize: '1rem'
                            }}
                        />
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

                {/* --- Step 2: Time Grid - UPDATED for hourly slots with Cairo timezone --- */}
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