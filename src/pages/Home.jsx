import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-portal apple-fade-in">
            {/* --- Hero Section --- */}
            <header className="hero-section">
                <div className="hero-content">
                    {/* REMOVED: logo-badge (OKZ SPORTS) */}
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

            {/* REMOVED: Duplicate Footer (The S.R.C Laboratories / 400 EGP part) */}

            <style>{`
                .home-portal {
                    max-width: 900px;
                    margin: 0 auto;
                    padding-bottom: 4rem;
                }

                .hero-section {
                    text-align: center;
                    padding: 4rem 1rem 3rem;
                }

                .hero-title {
                    font-size: clamp(2.5rem, 8vw, 4rem);
                    font-weight: 800;
                    letter-spacing: -0.04em;
                    line-height: 1.1;
                    margin-bottom: 1rem;
                    color: #000;
                }

                .hero-subtitle {
                    font-size: 1.25rem;
                    color: var(--text-muted);
                    max-width: 500px;
                    margin: 0 auto;
                }

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
                    border: none;
                    cursor: pointer;
                }

                .btn-secondary {
                    background: rgba(0,0,0,0.05);
                    border: none;
                    cursor: pointer;
                }

                .btn-link {
                    background: transparent;
                    border: none;
                    color: var(--system-blue);
                    font-size: 0.95rem;
                    cursor: pointer;
                    margin-top: 10px;
                }

                .apple-fade-in {
                    animation: fadeIn 0.8s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 600px) {
                    .hero-title { font-size: 2.5rem; }
                }
            `}</style>
        </div>
    );
};

export default Home;