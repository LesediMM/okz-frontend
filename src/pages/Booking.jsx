import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Booking = ({ user }) => {
    const navigate = useNavigate();
    
    const [bookingData, setBookingData] = useState({
        date: new Date().toISOString().split('T')[0],
        courtType: 'paddle', // Fixed: Back-end expects 'paddle'
        courtNumber: 1,
        timeSlot: '',
        duration: 1
    });

    const [isProcessing, setIsProcessing] = useState(false);

    // Court Mapping - Synced with Backend logic
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
            // Logic: If user switches to tennis, default to court 3. If paddle, default to 1.
            ...(name === 'courtType' && { courtNumber: value === 'paddle' ? 1 : 3 })
        }));
    };

    const handleBooking = async () => {
        if (!user) { navigate('/login'); return; }
        if (!bookingData.timeSlot) { alert("Please select a time."); return; }

        setIsProcessing(true);
        try {
            const res = await fetch('https://okz.onrender.com/api/v1/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-email': user.email },
                body: JSON.stringify(bookingData)
            });

            const data = await res.json();
            if (res.ok) { 
                navigate('/my-bookings'); 
            } else { 
                // Display the specific backend error (e.g., "Cannot book more than 30 days in advance")
                alert(data.errors ? data.errors[0].message : data.message); 
            }
        } catch (e) { 
            alert("Connection error. Please try again."); 
        } finally { 
            setIsProcessing(false); 
        }
    };

    return (
        <div className="booking-page apple-fade-in">
            <header className="page-header">
                <h1>Reserve a Court</h1>
                <p className="text-muted">Select your session details below.</p>
            </header>

            <div className="booking-layout">
                {/* --- Step 1: Configuration --- */}
                <section className="card glass-card config-section">
                    <div className="apple-segment-control">
                        <button 
                            className={bookingData.courtType === 'paddle' ? 'active' : ''} 
                            onClick={() => handleInputChange({ target: { name: 'courtType', value: 'paddle' }})}
                        >Paddle</button>
                        <button 
                            className={bookingData.courtType === 'tennis' ? 'active' : ''} 
                            onClick={() => handleInputChange({ target: { name: 'courtType', value: 'tennis' }})}
                        >Tennis</button>
                    </div>

                    <div className="input-group-row">
                        <div className="apple-input-field">
                            <label>DATE</label>
                            <input 
                                type="date" 
                                name="date" 
                                min={new Date().toISOString().split('T')[0]} 
                                value={bookingData.date} 
                                onChange={handleInputChange} 
                            />
                        </div>
                        <div className="apple-input-field">
                            <label>DURATION</label>
                            <select name="duration" value={bookingData.duration} onChange={handleInputChange}>
                                <option value="1">1 Hour</option>
                                <option value="2">2 Hours</option>
                            </select>
                        </div>
                    </div>

                    <div className="apple-input-field">
                        <label>SELECT COURT</label>
                        <select name="courtNumber" value={bookingData.courtNumber} onChange={handleInputChange}>
                            {courts.map(c => <option key={c.v} value={c.v}>{c.t}</option>)}
                        </select>
                    </div>
                </section>

                {/* --- Step 2: Time Selection --- */}
                <section className="time-selection-area">
                    <h3 className="section-title">Select Start Time</h3>
                    <div className="apple-slots-grid">
                        {timeSlots.map(time => (
                            <button 
                                key={time}
                                className={`slot-pill ${bookingData.timeSlot === time ? 'selected' : ''}`}
                                onClick={() => setBookingData(prev => ({ ...prev, timeSlot: time }))}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </section>

                {/* --- Step 3: Floating Checkout --- */}
                <div className="floating-checkout">
                    <div className="checkout-content">
                        <div className="checkout-text">
                            <span className="total-label">TOTAL PRICE</span>
                            <span className="total-price">{bookingData.duration * 400} EGP</span>
                        </div>
                        <button 
                            className={`btn btn-primary checkout-btn ${bookingData.timeSlot ? 'ready' : 'disabled'}`}
                            onClick={handleBooking}
                            disabled={isProcessing || !bookingData.timeSlot}
                        >
                            {isProcessing ? 'Confirming...' : 'Book Court'}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .booking-page { max-width: 900px; margin: 0 auto; padding: 1rem 1rem 8rem; }
                .page-header { margin-bottom: 2rem; }
                .page-header h1 { font-size: 2.2rem; font-weight: 800; letter-spacing: -1px; margin-bottom: 4px; }

                .apple-segment-control {
                    display: flex;
                    background: rgba(0,0,0,0.06);
                    padding: 4px;
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                }
                .apple-segment-control button {
                    flex: 1;
                    padding: 10px;
                    border: none;
                    background: transparent;
                    font-weight: 600;
                    font-size: 0.9rem;
                    border-radius: 9px;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .apple-segment-control button.active {
                    background: white;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
                    color: var(--system-blue);
                }

                .input-group-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 1.5rem; }
                .apple-input-field { display: flex; flex-direction: column; gap: 6px; }
                .apple-input-field label { font-size: 0.65rem; font-weight: 800; color: var(--system-gray); letter-spacing: 0.5px; margin-left: 4px;}
                
                .section-title { font-size: 1.1rem; font-weight: 700; margin: 2rem 0 1rem; }
                .apple-slots-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
                    gap: 10px;
                }
                .slot-pill {
                    background: white;
                    border: 1px solid rgba(0,0,0,0.06);
                    padding: 14px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .slot-pill.selected { 
                    background: var(--system-blue); 
                    color: white; 
                    border-color: var(--system-blue); 
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
                }

                .floating-checkout {
                    position: fixed;
                    bottom: 25px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 92%;
                    max-width: 480px;
                    background: rgba(255,255,255,0.8);
                    backdrop-filter: blur(25px);
                    -webkit-backdrop-filter: blur(25px);
                    border: 1px solid rgba(255,255,255,0.4);
                    border-radius: 24px;
                    padding: 16px 24px;
                    box-shadow: 0 12px 40px rgba(0,0,0,0.12);
                    z-index: 2000;
                }
                .checkout-content { display: flex; justify-content: space-between; align-items: center; }
                .checkout-text { display: flex; flex-direction: column; }
                .total-label { font-size: 0.65rem; font-weight: 800; color: var(--system-gray); }
                .total-price { font-size: 1.4rem; font-weight: 800; letter-spacing: -0.5px; color: #000; }
                .checkout-btn { padding: 12px 28px !important; border-radius: 14px; font-size: 1rem; }
                .checkout-btn.disabled { opacity: 0.4; pointer-events: none; }

                @media (max-width: 600px) {
                    .booking-page { padding-bottom: 10rem; }
                    .apple-slots-grid { grid-template-columns: repeat(3, 1fr); }
                }
            `}</style>
        </div>
    );
};

export default Booking;