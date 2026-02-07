import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Booking = ({ user }) => {
    const navigate = useNavigate();
    
    // 1. State Management
    const [bookingData, setBookingData] = useState({
        date: new Date().toISOString().split('T')[0],
        courtType: 'paddle',
        courtNumber: 1,
        timeSlot: '',
        duration: 1
    });

    const [isProcessing, setIsProcessing] = useState(false);

    // 2. Constants for Court Mapping
    const courts = bookingData.courtType === 'paddle' 
        ? [{ v: 1, t: 'Paddle Court 1' }, { v: 2, t: 'Paddle Court 2' }]
        : [{ v: 3, t: 'Tennis Court 1' }, { v: 4, t: 'Tennis Court 2' }, { v: 5, t: 'Tennis Court 3' }];

    // 3. Generate Time Slots (8:00 AM - 10:00 PM)
    const timeSlots = [];
    for (let hour = 8; hour <= 21; hour++) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => ({ ...prev, [name]: name === 'courtNumber' || name === 'duration' ? Number(value) : value }));
    };

    const handleBooking = async () => {
        if (!user) {
            alert("Please login to reserve a court.");
            navigate('/login');
            return;
        }

        if (!bookingData.timeSlot) {
            alert("Please select a time slot.");
            return;
        }

        setIsProcessing(true);
        try {
            const res = await fetch('https://okz.onrender.com/api/v1/bookings', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-user-email': user.email 
                },
                body: JSON.stringify(bookingData)
            });

            const data = await res.json();
            if (res.ok) {
                alert("✅ Court reserved successfully!");
                navigate('/my-bookings');
            } else {
                alert(`Booking failed: ${data.message}`);
            }
        } catch (e) {
            alert("Network error. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="booking-page">
            <div className="booking-header">
                <h2>🎾 Reserve a Court</h2>
                {!user && <p className="warning-text">⚠️ You must be logged in to book.</p>}
            </div>

            <div className="booking-form-grid">
                {/* Form Controls */}
                <div className="booking-controls">
                    <div className="form-group">
                        <label>📅 Date</label>
                        <input 
                            type="date" 
                            name="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={bookingData.date}
                            onChange={handleInputChange}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>🏟️ Court Type</label>
                        <select name="courtType" value={bookingData.courtType} onChange={handleInputChange}>
                            <option value="paddle">Paddle</option>
                            <option value="tennis">Tennis</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>🏷️ Court Number</label>
                        <select name="courtNumber" value={bookingData.courtNumber} onChange={handleInputChange}>
                            {courts.map(c => <option key={c.v} value={c.v}>{c.t}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>⏳ Duration</label>
                        <select name="duration" value={bookingData.duration} onChange={handleInputChange}>
                            <option value="1">1 Hour</option>
                            <option value="2">2 Hours</option>
                        </select>
                    </div>
                </div>

                {/* Time Slot Selection */}
                <div className="time-slots-section">
                    <h3>⏰ Select Time</h3>
                    <div className="slots-grid">
                        {timeSlots.map(time => (
                            <button 
                                key={time}
                                className={`time-slot-btn ${bookingData.timeSlot === time ? 'selected' : ''}`}
                                onClick={() => setBookingData(prev => ({ ...prev, timeSlot: time }))}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Summary & Action */}
                <div className="booking-summary-card">
                    <div className="summary-details">
                        <p><strong>Total:</strong> {bookingData.duration * 400} EGP</p>
                        {bookingData.timeSlot && <p><strong>Time:</strong> {bookingData.timeSlot} for {bookingData.duration}hr</p>}
                    </div>
                    <button 
                        className={`book-btn-final ${bookingData.timeSlot && user ? 'active' : ''}`}
                        onClick={handleBooking}
                        disabled={isProcessing || !user}
                    >
                        {isProcessing ? 'Processing...' : 'CONFIRM BOOKING'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Booking;