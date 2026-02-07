import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Booking.css';

const Booking = ({ user }) => {
    const navigate = useNavigate();
    
    const [bookingData, setBookingData] = useState({
        date: new Date().toISOString().split('T')[0],
        courtType: 'paddle', 
        courtNumber: 1,
        timeSlot: '',
        duration: 1
    });

    const [isProcessing, setIsProcessing] = useState(false);

    // Court Mapping - Synced with Backend
    const courts = bookingData.courtType === 'paddle' 
        ? [{ v: 1, t: 'Paddle Court 1' }, { v: 2, t: 'Paddle Court 2' }]
        : [{ v: 3, t: 'Tennis Court 1' }, { v: 4, t: 'Tennis Court 2' }, { v: 5, t: 'Tennis Court 3' }];

    const timeSlots = [];
    for (let hour = 8; hour <= 21; hour++) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => ({ 
            ...prev, 
            [name]: name === 'courtNumber' || name === 'duration' ? Number(value) : value,
            ...(name === 'courtType' && { courtNumber: value === 'paddle' ? 1 : 3 })
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
                // Success case
                navigate('/my-bookings'); 
            } else { 
                // Handle backend validation errors (e.g., 400 Bad Request)
                const errorMsg = data.errors ? data.errors[0].message : (data.message || "Slot unavailable");
                alert(`Booking Failed: ${errorMsg}`); 
            }
        } catch (e) { 
            // Handle Network failures
            console.error("Connection Error:", e);
            alert("Network error. Please check your connection and try again."); 
        } finally { 
            // 🛡️ Guard 4: The "Loading" Killer (Always reset state)
            setIsProcessing(false); 
        }
    };

    return (
        <div className="booking-page-container apple-fade-in">
            <header className="page-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 className="hero-title">Reserve a Court</h1>
                <p className="text-muted">Premium Padel and Tennis facilities in Cairo.</p>
            </header>

            <div className="booking-layout-grid">
                {/* --- Step 1: Configuration --- */}
                <section className="glass-panel config-panel" style={{ padding: '30px', marginBottom: '40px' }}>
                    <div className="segmented-control">
                        <button 
                            type="button"
                            className={bookingData.courtType === 'paddle' ? 'active' : ''} 
                            onClick={() => handleInputChange({ target: { name: 'courtType', value: 'paddle' }})}
                        >Paddle</button>
                        <button 
                            type="button"
                            className={bookingData.courtType === 'tennis' ? 'active' : ''} 
                            onClick={() => handleInputChange({ target: { name: 'courtType', value: 'tennis' }})}
                        >Tennis</button>
                    </div>

                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="field-group">
                            <label className="input-label-tiny">DATE</label>
                            <input 
                                type="date" 
                                name="date" 
                                min={new Date().toISOString().split('T')[0]} 
                                value={bookingData.date} 
                                onChange={handleInputChange} 
                            />
                        </div>
                        <div className="field-group">
                            <label className="input-label-tiny">DURATION</label>
                            <select name="duration" value={bookingData.duration} onChange={handleInputChange}>
                                <option value="1">1 Hour</option>
                                <option value="2">2 Hours</option>
                            </select>
                        </div>
                    </div>

                    <div className="field-group" style={{ marginTop: '10px' }}>
                        <label className="input-label-tiny">PREVIEW COURT</label>
                        <select name="courtNumber" value={bookingData.courtNumber} onChange={handleInputChange}>
                            {courts.map(c => <option key={c.v} value={c.v}>{c.t}</option>)}
                        </select>
                    </div>
                </section>

                {/* --- Step 2: Time Grid --- */}
                <section className="time-picker-section">
                    <h3 className="section-heading">Available Slots</h3>
                    <div className="time-pill-grid">
                        {timeSlots.map(time => (
                            <button 
                                key={time}
                                type="button"
                                className={`time-pill ${bookingData.timeSlot === time ? 'selected' : ''}`}
                                onClick={() => setBookingData(prev => ({ ...prev, timeSlot: time }))}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </section>

                {/* --- Step 3: Checkout Bar --- */}
                <div className="glass-panel floating-checkout-bar">
                    <div className="checkout-flex">
                        <div className="price-display">
                            <span className="price-label">ESTIMATED TOTAL</span>
                            <span className="price-value">{bookingData.duration * 400} EGP</span>
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