import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-portal apple-fade-in">
            {/* --- Hero Section --- */}
            <header className="hero-section">
                <div className="hero-content">
                    <div className="logo-badge">OKZ SPORTS</div>
                    <h1 className="hero-title">Elevate your game.</h1>
                    <p className="hero-subtitle">
                        Premier Padel & Tennis Court Management in the heart of Egypt.
                    </p>
                </div>
            </header>

            {/* --- Main Action Card --- */}
            <div className="portal-grid">
                <div className="card glass-card main-portal">
                    <div className="card-header">
                        <div className="apple-icon">🎾</div>
                        <h2>Player Portal</h2>
                        <p className="text-muted">Everything you need to stay on the court.</p>
                    </div>
                    
                    <div className="feature-grid">
                        <div className="feature-item">
                            <span className="feature-label">Flat Rate</span>
                            <span className="feature-value">400 EGP / hr</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-label">Availability</span>
                            <span className="feature-value">Instant</span>
                        </div>
                    </div>

                    <div className="action-stack">
                        <button 
                            onClick={() => navigate('/booking')} 
                            className="btn btn-primary btn-large"
                        >
                            Reserve a Court
                        </button>
                        
                        <div className="action-row">
                            <button 
                                onClick={() => navigate('/login')} 
                                className="btn btn-secondary"
                            >
                                Sign In
                            </button>
                            <button 
                                onClick={() => navigate('/register')} 
                                className="btn btn-secondary"
                            >
                                Register
                            </button>
                        </div>

                        <button 
                            onClick={() => navigate('/dashboard')} 
                            className="btn btn-link"
                        >
                            View Dashboard →
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Info Footer --- */}
            <footer className="apple-footer">
                <div className="footer-glass">
                    <div className="info-bits">
                        <div className="bit">
                            <strong>HOURS</strong>
                            <span>8:00 AM — 10:00 PM</span>
                        </div>
                        <div className="bit">
                            <strong>LOCATION</strong>
                            <span>Main Sports Complex</span>
                        </div>
                    </div>
                    <div className="copyright-area">
                        <p>© {new Date().getFullYear()} S.R.C Laboratories. All Rights Reserved.</p>
                        <p className="location-tag">Made for Egypt 🇪🇬</p>
                    </div>
                </div>
            </footer>

            <style>{`
                .home-portal {
                    max-width: 900px;
                    margin: 0 auto;
                    padding-bottom: 4rem;
                }

                /* Hero Typography */
                .hero-section {
                    text-align: center;
                    padding: 4rem 1rem 3rem;
                }
                .logo-badge {
                    font-weight: 700;
                    font-size: 0.8rem;
                    letter-spacing: 2px;
                    color: var(--system-gray);
                    margin-bottom: 1rem;
                }
                .hero-title {
                    font-size: clamp(2.5rem, 8vw, 4rem);
                    font-weight: 800;
                    letter-spacing: -0.04em;
                    line-height: 1.1;
                    margin-bottom: 1rem;
                    background: linear-gradient(180deg, #000 0%, #636366 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .hero-subtitle {
                    font-size: 1.25rem;
                    color: var(--text-muted);
                    max-width: 500px;
                    margin: 0 auto;
                }

                /* Glass Card Specifics */
                .main-portal {
                    text-align: center;
                    margin-top: 2rem;
                }
                .apple-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }
                .feature-grid {
                    display: flex;
                    justify-content: center;
                    gap: 2rem;
                    margin: 2rem 0;
                    padding: 1.5rem;
                    background: rgba(0,0,0,0.03);
                    border-radius: 14px;
                }
                .feature-item {
                    display: flex;
                    flex-direction: column;
                }
                .feature-label {
                    font-size: 0.7rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    color: var(--text-muted);
                }
                .feature-value {
                    font-weight: 700;
                    font-size: 1.1rem;
                }

                /* Layout */
                .action-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .action-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                .btn-large {
                    padding: 18px !important;
                    font-size: 1.1rem;
                }
                .btn-link {
                    background: transparent;
                    color: var(--system-blue);
                    font-size: 0.95rem;
                }

                /* Footer */
                .apple-footer {
                    margin-top: 5rem;
                    text-align: center;
                }
                .info-bits {
                    display: flex;
                    justify-content: center;
                    gap: 3rem;
                    margin-bottom: 2rem;
                }
                .bit strong {
                    display: block;
                    font-size: 0.65rem;
                    letter-spacing: 1px;
                    color: var(--text-muted);
                    margin-bottom: 4px;
                }
                .bit span {
                    font-weight: 500;
                    font-size: 0.9rem;
                }
                .copyright-area {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    border-top: 0.5px solid rgba(0,0,0,0.1);
                    padding-top: 2rem;
                }

                /* Animation */
                .apple-fade-in {
                    animation: fadeIn 0.8s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 600px) {
                    .info-bits { flex-direction: column; gap: 1.5rem; }
                    .hero-title { font-size: 2.5rem; }
                }
            `}</style>
        </div>
    );
};

export default Home;