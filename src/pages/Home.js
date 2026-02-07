import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-portal">
            <header className="portal-header">
                <div className="logo-wrapper">
                    <h1>OKZ SPORTS</h1>
                    <span className="badge">EGYPT</span>
                </div>
                <p>Premier Padel & Tennis Court Management</p>
            </header>

            <div className="portal-grid single-column">
                <div className="portal-card user-card">
                    <div className="portal-icon">🎾</div>
                    <h2>Player Portal</h2>
                    <p>Book professional courts, view your schedule, and manage your sport sessions.</p>
                    
                    <ul className="feature-list">
                        <li>Instant Court Booking</li>
                        <li>400 EGP / Hour Flat Rate</li>
                        <li>Match History Tracking</li>
                    </ul>

                    <div className="portal-actions">
                        {/* Standard buttons now use navigate() instead of manual render calls */}
                        <button 
                            onClick={() => navigate('/login')} 
                            className="btn btn-primary"
                        >
                            User Login
                        </button>
                        
                        <button 
                            onClick={() => navigate('/register')} 
                            className="btn btn-outline"
                        >
                            Create Account
                        </button>
                        
                        <button 
                            onClick={() => navigate('/dashboard')} 
                            className="btn btn-secondary"
                        >
                            Go to Dashboard
                        </button>
                        
                        <button 
                            onClick={() => navigate('/booking')} 
                            className="btn btn-secondary"
                        >
                            Book a Court
                        </button>
                        
                        <p className="guest-msg">
                            Welcome! Please login or register to access all features.
                        </p>
                    </div>
                </div>
            </div>

            <footer className="portal-footer">
                <div className="footer-info">
                    <span>⏰ 8:00 AM - 10:00 PM</span>
                    <span className="separator">|</span>
                    <span>📍 Main Sports Complex</span>
                </div>
                <p className="copyright">
                    &copy; {new Date().getFullYear()} S.R.C Laboratories. All Rights Reserved.
                </p>
            </footer>
        </div>
    );
};

export default Home;