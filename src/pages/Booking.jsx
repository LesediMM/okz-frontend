import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Booking.css';

const Booking = ({ user }) => {
    const navigate = useNavigate();
    
    const [bookingData, setBookingData] = useState({
        date: new Date().toISOString().split('T')[0],
        courtType: 'padel', // 👈 Changed from 'paddle' to 'padel'
        courtNumber: 1,
        timeSlot: '',
        duration: 1
    });

    const [pricing, setPricing] = useState({
        padel: 400, // 👈 Changed from 'paddle' to 'padel'
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
                    padel: parseInt(data.system.pricing.padel) || 400, // 👈 Changed from 'paddle' to 'padel'
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
    const courts = bookingData.courtType === 'padel' // 👈 Changed from 'paddle' to 'padel'
        ? [{ v: 1, t: 'Padel Court 1' }, { v: 2, t: 'Padel Court 2' }]
        : [{ v: 3, t: 'Tennis Court 1' }, { v: 4, t: 'Tennis Court 2' }, { v: 5, t: 'Tennis Court 3' }];

    // Smart Time Slot Filtering - UPDATED to hourly slots only
    const generateAvailableSlots = () => {
        const slots = [];
        const now = new Date();
        const isToday = bookingData.date === now.toISOString().split('T')[0];
        const currentHour = now.getHours();

        for (let hour = 8; hour < 22; hour++) { // 🛡️ Sync with OPERATING_HOURS.end: 22
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            
            // 🛡️ Filter out times that have already passed if the date is today
            if (isToday && hour <= currentHour) {
                continue; // Skip past times (including current hour if it's already started)
            }
            slots.push(timeStr);
        }
        return slots;
    };

    const timeSlots = generateAvailableSlots();

    // Calculate total price based on court type and duration
    const calculateTotalPrice = () => {
        const rate = bookingData.courtType === 'padel' ? pricing.padel : pricing.tennis; // 👈 Changed both
        return bookingData.duration * rate;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => ({ 
            ...prev, 
            [name]: name === 'courtNumber' || name === 'duration' ? Number(value) : value,
            ...(name === 'courtType' && { courtNumber: value === 'padel' ? 1 : 3 }) // 👈 Changed from 'paddle' to 'padel'
        }));
    };

    const handleBooking = async () => {
        // 🛡️ Guard 1: Redirect if no user
        if (!user) { 
            alert("Please login to reserve a court.");
            navigate('/login'); 
            return; 
        }

        // 🛡️ Guard 2: The "Data Corruption" Killer (Input Validation)
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
                    // 🛡️ Guard 3: Safe Property Access
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
            // 🛡️ Guard 4: The "Loading" Killer (Always reset state)
            setIsProcessing(false); 
        }
    };

    // Get current rate display
    const currentRate = bookingData.courtType === 'padel' ? pricing.padel : pricing.tennis; // 👈 Changed from 'paddle' to 'padel'

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
                    <span>🏸 Padel: {pricing.padel} EGP/hr</span> {/* 👈 Changed from pricing.paddle to pricing.padel */}
                </div>
            </header>

            <div className="booking-layout-grid">
                {/* --- Step 1: Configuration --- */}
                <section className="glass-panel config-panel" style={{ padding: '30px', marginBottom: '40px' }}>
                    <div className="segmented-control">
                        <button 
                            type="button"
                            className={bookingData.courtType === 'padel' ? 'active' : ''} // 👈 Changed from 'paddle' to 'padel'
                            onClick={() => handleInputChange({ target: { name: 'courtType', value: 'padel' }})} // 👈 Changed from 'paddle' to 'padel'
                        >Padel ({pricing.padel} EGP)</button> {/* 👈 Changed from pricing.paddle to pricing.padel */}
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

                {/* --- Step 2: Time Grid - UPDATED for hourly slots --- */}
                <section className="time-picker-section">
                    <h3 className="section-heading">
                        Available Slots 
                        <span style={{ fontSize: '0.8rem', marginLeft: '10px', fontWeight: 'normal', opacity: 0.7 }}>
                            (Full hours only)
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
                            className={`confirm-booking-btn ${(!bookingData.timeSlot || isProcessing) ? 'disabled' : ''}`}
                            onClick={handleBooking}
                            disabled={isProcessing || !bookingData.timeSlot}
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