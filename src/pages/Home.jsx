import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';
import '../styles/Home.css'; // New dedicated style file

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container apple-fade-in">
            {/* --- Hero Section --- */}
            <header className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Elevate your game.</h1>
                    <p className="hero-subtitle">
                        Premier Padel & Tennis Court Management in the heart of Egypt.
                    </p>
                </div>
            </header>

            {/* --- Main Portal Card --- */}
            <div className="portal-wrapper">
                <div className="glass-panel main-portal-card">
                    <div className="card-header">
                        <h2>Player Portal</h2>
                        <p className="text-muted">Everything you need to stay on the court.</p>
                    </div>
                    
                    <div className="feature-highlight">
                        <div className="feature-item">
                            <span className="feature-label">Flat Rate</span>
                            <span className="feature-val"> 400 EGP / hr</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-label">Availability</span>
                            <span className="feature-val"> Instant</span>
                        </div>
                    </div>

                    <div className="home-actions">
                        <button 
                            onClick={() => navigate('/booking')} 
                            className="btn-primary btn-hero"
                        >
                            Reserve a Court
                        </button>
                        
                        <div className="button-group-row">
                            <button 
                                onClick={() => navigate('/login')} 
                                className="btn-secondary-glass"
                            >
                                Sign In
                            </button>
                            <button 
                                onClick={() => navigate('/register')} 
                                className="btn-secondary-glass"
                            >
                                Register
                            </button>
                        </div>

                        <button 
                            onClick={() => navigate('/dashboard')} 
                            className="btn-text-link"
                        >
                            View Dashboard →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;